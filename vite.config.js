import { defineConfig } from "vite";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest";

export default defineConfig(() => {
	return {
		build: {
			emptyOutDir: true,
			outDir: "build",
			rollupOptions: {
				input: {
					save: "./src/pages/save.html",
					error: "./src/pages/error.html",
				},
				output: {
					chunkFileNames: "assets/chunk-[hash].js",
				},
			},
			target: "esnext",
		},
		plugins: [crx({ manifest })],
	};
});
