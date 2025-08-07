import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
	name: "Archive Button",
	description: "Button to go straight to the internet archive",
	version: "1.0.4",
	author: "r0uge",
	manifest_version: 3,
	/** @ts-ignore */
	browser_specific_settings: {
		gecko: {
			id: "archvbtn@r0uge.org",
		},
	},
	background: {
		service_worker: "src/background.ts",
	},
	action: {
		default_title: "Go to the archive",
		/** @ts-ignore */
		default_area: "navbar",
		default_popup: "src/pages/popup.html",
	},
	permissions: ["activeTab"],
});
