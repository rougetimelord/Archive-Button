/**
 * @type {chrome}
 */
const api = !!chrome ? chrome : browser;

api.tabs.query({ active: true, currentWindow: true }, (tabs) => {
	api.runtime.sendMessage(tabs[0], (data) => {
		if (!data) {
			return;
		}
		if (data.type == "error") {
			fetch(api.runtime.getURL("src/pages/error.html"))
				.then((res) => res.text())
				.then((text) => {
					document.write(text);
					document.getElementById("m").innerText = data.msg;
				});
		} else if (data.type == "save") {
			fetch(api.runtime.getURL("src/pages/save.html"))
				.then((res) => res.text())
				.then((text) => {
					document.write(text);
					document
						.getElementById("b")
						.setAttribute(
							"href",
							`https://web.archive.org/save/${encodeURI(data.msg)}`,
						);
				});
		}
	});
});
