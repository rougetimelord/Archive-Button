/** @type {chrome} */
const api = !!chrome ? chrome : browser;

/**
 * @param {number} ms
 * @returns
 */
const delay = async (ms) =>
	new Promise((res) => {
		setTimeout(res, ms);
	});

const savePopup = (message, sendResponse) => {
	sendResponse({ type: "save", msg: message });
};

const errorPopup = (message, sendResponse) => {
	sendResponse({ type: "error", msg: message });
};

/**
 * @param {chrome.tabs.Tab} tab
 */
const run = (tab, _, sendResponse) => {
	const search = new URL(tab.url);
	search.search = "";
	const url = new URL("http://archive.org/wayback/available");
	url.search = new URLSearchParams({
		url: encodeURI(search),
	});
	/**
	 * @type {ArchiveResponse}
	 */
	let json;
	try {
		json = fetch(url)
			.then((response) => response.json())
			.then((json) => {
				if (json?.code) {
					console.debug(`IA err: ${json?.message}`);
					errorPopup(json.message, sendResponse);
				} else {
					let ptr = json;
					if (!ptr.hasOwnProperty("archived_snapshots")) {
						console.error(`Unexpected shape: ${JSON.stringify(json)}`);
						errorPopup(`Unexpected shape: ${json}`, sendResponse);
					} else {
						ptr = ptr.archived_snapshots;
						if (ptr.hasOwnProperty("closest")) {
							ptr = ptr.closest;
							api.tabs.update(tab.id, {
								url: ptr.url.replace(/^https?/, "https"),
							});
							sendResponse(null);
						} else {
							console.debug(`No snapshots ${search}, json: ${JSON.stringify(json)}`);
							savePopup(search, sendResponse);
						}
					}
				}
			});
	} catch (e) {
		console.error(e);
		errorPopup(e, sendResponse);
		return true;
	}
	return true;
};

api.runtime.onMessage.addListener(run);
