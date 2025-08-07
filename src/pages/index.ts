/** @ts-ignore API types suck to deal with*/
const _api = !!chrome ? chrome : browser;

_api.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
	_api.runtime.sendMessage(tabs[0], (data: { type: string; msg: string } | null) => {
		if (data === null) {
			document.body.classList.add("success");
			setTimeout(() => window.close(), 1000);
			return;
		}
		if (data.type == "error") {
			document.body.className = "error";
			document.getElementById("loader")?.setAttribute("hidden", "");
			document.getElementById("error")?.removeAttribute("hidden");
			document.getElementById("mError")!.innerText = data.msg;
		} else if (data.type == "save") {
			document.body.className = "save";
			document.getElementById("loader")?.setAttribute("hidden", "");
			document.getElementById("save")?.removeAttribute("hidden");
			document
				.getElementById("b")!
				.setAttribute(
					"href",
					`https://web.archive.org/save/${encodeURI(data.msg)}`,
				);
		}
	});
});
