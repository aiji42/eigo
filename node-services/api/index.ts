import { Hono } from 'hono';
import { handle } from '@hono/node-server/vercel';
import { removeBackground } from '@imgly/background-removal-node';
import sharp from 'sharp';

const app = new Hono().basePath('/api');

app.get('/remove-background', async (c) => {
	const img = c.req.query('img');
	if (!img) return c.notFound();

	let foreground = await removeBackground(img, {
		debug: true,
		progress: console.log,
		output: {
			format: 'image/png',
		},
	}).then((res) => res.arrayBuffer());

	if (c.req.query('fit')) foreground = await sharp(foreground).trim().toFormat('png').toBuffer();

	return new Response(foreground, {
		headers: {
			'Content-Type': 'image/png',
			'Content-Length': foreground.byteLength.toString(),
		},
	});
});

export default handle(app);
