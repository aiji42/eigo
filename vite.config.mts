import pages from '@hono/vite-cloudflare-pages';
import cloudflareAdapter from '@hono/vite-dev-server/cloudflare';
import devServer from '@hono/vite-dev-server';
import { defineConfig } from 'vite';
import { replaceCodePlugin } from 'vite-plugin-replace';
import { run } from 'vite-plugin-run';
import { execSync } from 'node:child_process';

export default defineConfig(async ({ mode, command }) => {
	if (mode === 'client') {
		// public/static/style.*を消す(tailwindcssのコンパイルとviteのビルドが競合するので)
		execSync('rm -rf public/static/style.*');
		const digest = new Date().getTime().toString();

		return {
			plugins: [
				// ビルドが始まる前にtailwindcssのコンパイルを行う
				run([
					{
						name: 'build tailwindcss',
						run: ['npx', 'tailwind', '-i', './src/index.css', '-o', `./public/static/style.${digest}.css`, '--minify'],
					},
				]),
			],
			build: {
				rollupOptions: {
					input: './src/client.tsx',
					output: {
						entryFileNames: `static/client.${digest}.js`,
						chunkFileNames: 'static/[name]-[hash].js',
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
				command === 'build' &&
					replaceCodePlugin({
						replacements: [
							{
								from: /__DIGEST__/g,
								// dist/static/client.{digest}.jsからdigestを取得する
								to:
									execSync('ls dist/static/client.*.js')
										.toString()
										.match(/client\.(\d+)\.js/)?.[1] ?? '',
							},
						],
					}),
				devServer({
					entry: 'src/index.tsx',
					adapter: cloudflareAdapter,
				}),
				command === 'serve' &&
					run([
						{
							name: 'build tailwindcss',
							build: false,
							run: ['npx', 'tailwind', '-i', './src/index.css', '-o', `./public/static/style.css`, '--watch'],
						},
					]),
			],
		};
	}
});
