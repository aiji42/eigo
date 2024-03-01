import pages from '@hono/vite-cloudflare-pages';
import devServer from '@hono/vite-dev-server';
import { defineConfig } from 'vite';
import { getPlatformProxy } from 'wrangler';

export default defineConfig(async ({ mode }) => {
	const { env, dispose } = await getPlatformProxy();
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
				devServer({
					entry: 'src/index.tsx',
					adapter: {
						env,
						onServerClose: dispose,
					},
				}),
			],
		};
	}
});
