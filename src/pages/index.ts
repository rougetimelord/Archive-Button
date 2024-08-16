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
			fetch(_api.runtime.getURL("src/pages/error.html"))
				.then((res) => res.text())
				.then((text) => {
					document.write(text);
					document.getElementById("m")!.innerText = data.msg;
				});
		} else if (data.type == "save") {
			fetch(_api.runtime.getURL("src/pages/save.html"))
				.then((res) => res.text())
				.then((text) => {
					document.write(text);
					document
						.getElementById("b")!
						.setAttribute(
							"href",
							`https://web.archive.org/save/${encodeURI(data.msg)}`,
						);
				});
		}
	});
});
