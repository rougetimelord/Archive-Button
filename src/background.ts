/** @ts-ignore annoying to do the type shuffle */
const _api = !!chrome ? chrome : browser;

const delay = async (ms: number) =>
	new Promise((res) => {
		setTimeout(res, ms);
	});

const savePopup = (message: string, sendResponse: (response?: any) => void) => {
	sendResponse({ type: "save", msg: message });
};

const errorPopup = (message: string | undefined, sendResponse: (response?: any) => void) => {
	sendResponse({ type: "error", msg: message });
};

const run = (tab: chrome.tabs.Tab, _: any, sendResponse: (response?: any) => void) => {
	let search: URL;
	try {
		if (tab.url == undefined) {
			errorPopup("You somehow are on a page with an undefined url...", sendResponse);
			return true;
		}
		search = new URL(tab.url as string);
	} catch (e) {
		console.error(`Error in URL creation ${e}, ${tab.url}`);
		errorPopup("Something happened! Check your extension logs", sendResponse);
		return true;
	}

	if (!/https?/i.test(search.protocol)) {
		errorPopup("You can only use the Archive button on websites!", sendResponse);
		return true;
	} else if (/web.archive.org/i.test(search.hostname)) {
		errorPopup("You're already on an archived page!", sendResponse);
		return true;
	}
	const url = new URL("https://archive.org/wayback/available");
	url.search = new URLSearchParams({
		url: encodeURI(`${search.host}${search.pathname}`),
	}).toString();

	try {
		fetch(url)
			.then((response) => response.json())
			.then((json: ArchiveResponse) => {
				if (json?.code) {
					console.debug(`IA err: ${json?.message}`);
					errorPopup(json.message, sendResponse);
				} else {
					if (!json?.archived_snapshots) {
						console.error(`Unexpected shape: ${JSON.stringify(json)}`);
						errorPopup(`Unexpected shape: ${json}`, sendResponse);
					} else if (json.archived_snapshots?.closest) {
						_api.tabs.update(tab.id as number, {
							url: json.archived_snapshots.closest.url.replace(/^https?/, "https"),
						});
						sendResponse(null);
					} else {
						console.debug(`No snapshots ${search}, json: ${JSON.stringify(json)}`);
						const saveURL = `https://web.archive.org/save/${encodeURI(search.href)}?skip_first_archive=1`;
						fetch(saveURL, {method: "GET", mode: "no-cors"}).then((res) => {}
						).catch((e) => {});
						savePopup(search.href, sendResponse);
					}
				}
			});
	} catch (e) {
		console.error(e);
		errorPopup(e as string, sendResponse);
		return true;
	}
	return true;
};

_api.runtime.onMessage.addListener(run);
