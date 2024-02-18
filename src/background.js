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
const run = async (tab, _, sendResponse) => {
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
		json = await fetch(url).then((response) => response.json());
	} catch (e) {
		console.error(e);
		errorPopup(e, sendResponse);
		return;
	}

	if (json?.code) {
		console.debug(`IA err: ${json?.message}`);
		errorPopup(json.message, sendResponse);
	} else {
		let ptr = json;
		for (const k of ["archived_snapshots", "closest"]) {
			if (ptr.hasOwnProperty(k)) {
				ptr = ptr[k];
			} else if (k == "archived_snapshots") {
				console.error(`Unexpected shape: ${json}`);
				errorPopup(`Unexpected shape: ${json}`, sendResponse);
				return;
			} else {
				console.debug(`No snapshots ${search}, json: ${json}`);
				savePopup(search, sendResponse);
				return;
			}
		}

		api.tabs.update(tab.id, {
			url: ptr.url.replace(/^https?/, "https"),
		});
	}
};

api.runtime.onMessage.addListener(run);
