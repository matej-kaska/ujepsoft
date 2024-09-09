import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import sassGlobImports from "vite-plugin-sass-glob-import";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), svgr(), tsconfigPaths(), sassGlobImports()],
	server: {
		host: true,
		port: 3000,
		strictPort: true,
		watch: {
			usePolling: true,
		},
		hmr: {
			clientPort: 3000,
			overlay: false,
		},
	},
	define: {
		global: "window",
		"VITE_GITHUB_USERNAME": JSON.stringify(process.env.VITE_GITHUB_USERNAME),
		"VITE_WEBSITE_URL": JSON.stringify(process.env.VITE_WEBSITE_URL),
	},
	build: {
		sourcemap: true,
		minify: "terser"
	},
	css: {
		postcss: "./postcss.config.js"
  },
	publicDir: "public",
});
