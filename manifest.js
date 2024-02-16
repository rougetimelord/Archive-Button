import {defineManifest} from '@crxjs/vite-plugin';

export default defineManifest({
    name: "Archive Button",
    description: "Button to go straight to the internet archive",
    version: "0.0.0",
    author: "r0uge",
    manifest_version: 3,
    browser_specific_settings: {
        gecko: {
            id: "archvbtn@r0uge.org"
        }
    },
    background: {
        service_worker: "src/background.js"
    },
    action:{
        default_title: "Go to the archive"
    },
    permissions: ["activeTab"],
    host_permissions:[]
});