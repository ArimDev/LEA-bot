import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import { createHtmlPlugin } from "vite-plugin-html";
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd());
	return {
		root: "./site",
		base: '/', // new/
		plugins: [
			vue(),
			createHtmlPlugin({
				inject: {
					data: {
						VITE_DOMAIN: env.VITE_DOMAIN,
						VITE_BOT_ID: env.VITE_BOT_ID,
						VITE_BOT_REDIRECT: env.VITE_BOT_REDIRECT
					},
				},
			})
		],
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./site', import.meta.url))
			}
		}
	};
});