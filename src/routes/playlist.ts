import { Hono } from 'hono';
import { Bindings } from '../bindings';
import { isCEFRLevel } from '../libs/utils';

const app = new Hono<{ Bindings: Bindings }>();

export const playlist = app
	.get('/:entryId/playlist.m3u8', async (c) => {
		const id = c.req.param('entryId');
		const data = await c.env.Playlist.make({ entryId: Number(id), level: null });

		return new Response(data.m3u, { headers: { 'Content-Type': 'application/vnd.apple.mpegurl' } });
	})
	.get('/:entryId/:level/playlist.m3u8', async (c) => {
		const id = c.req.param('entryId');
		const level = c.req.param('level');
		if (!isCEFRLevel(level)) return c.notFound();
		const data = await c.env.Playlist.make({ entryId: Number(id), level });

		return new Response(data.m3u, { headers: { 'Content-Type': 'application/vnd.apple.mpegurl' } });
	});
