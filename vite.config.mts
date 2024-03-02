import pages from '@hono/vite-cloudflare-pages';
import devServer from '@hono/vite-dev-server';
import { defineConfig } from 'vite';
import { replaceCodePlugin } from 'vite-plugin-replace';
import { run } from 'vite-plugin-run';
import { getPlatformProxy } from 'wrangler';
import { execSync } from 'node:child_process';

export default defineConfig(async ({ mode, command }) => {
	if (mode === 'client') {
		// public/staticディレクトリを空にする(tailwindcssのコンパイルとviteのビルドが競合するので)
		execSync('rm -rf public/static');
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
				command === 'serve' &&
					(await getPlatformProxy().then(({ env, dispose }) =>
						devServer({
							entry: 'src/index.tsx',
							adapter: {
								env,
								onServerClose: dispose,
							},
						}),
					)),
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
