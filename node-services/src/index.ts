import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { removeBackground } from '@imgly/background-removal-node';
import sharp from 'sharp';

const app = new Hono();

app.get('/remove-background', async (c) => {
	const img = c.req.query('img');
	if (!img) return c.notFound();

	let foreground = await removeBackground(img, {
		debug: true,
		progress: console.log,
		output: {
			format: 'image/webp',
		},
	}).then((res) => res.arrayBuffer());

	if (c.req.query('fit')) foreground = await sharp(foreground).trim().toFormat('webp').toBuffer();

	return new Response(foreground, {
		headers: {
			'Content-Type': 'image/webp',
			'Content-Length': foreground.byteLength.toString(),
		},
	});
});

const port = 8080;
console.log(`Server is running on http://localhost:${port}`);

serve({
	fetch: app.fetch,
	port,
});
