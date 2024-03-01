import pages from '@hono/vite-cloudflare-pages';
import devServer from '@hono/vite-dev-server';
import { defineConfig } from 'vite';
import { getPlatformProxy } from 'wrangler';

export default defineConfig(async ({ mode, command }) => {
	if (mode === 'client') {
		return {
			build: {
				rollupOptions: {
					input: './src/client.tsx',
					output: {
						entryFileNames: 'static/client.js',
					},
				},
			},
		};
	} else {
		return {
			ssr: {
				external: ['react', 'react-dom'],
			},
			plugins: [
				pages(),
				command === 'serve' && await getPlatformProxy().then(({ env, dispose }) => devServer({
					entry: 'src/index.tsx',
					adapter: {
						env,
						onServerClose: dispose,
					},
				}))
			],
		};
	}
});
