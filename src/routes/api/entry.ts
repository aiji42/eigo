import { getCalibratedEntryByEntryIdAndCefrLevel, getEntryById, getNextEntry, getPrevEntry } from '../../libs/db';
import { HTTPException } from 'hono/http-exception';
import { zValidator } from '@hono/zod-validator';
import z from 'zod';
import { Hono } from 'hono';
import { Bindings } from '../../bindings';

const app = new Hono<{ Bindings: Bindings }>();

export const apiEntry = app
	.get('/:id', async (c) => {
		const id = c.req.param('id');
		const [entry, next, prev] = await Promise.all([
			getEntryById(c.env.DB, Number(id)),
			getNextEntry(c.env.DB, Number(id)),
			getPrevEntry(c.env.DB, Number(id)),
		]);
		if (!entry) throw new HTTPException(404, { message: 'Entry not found' });

		return c.json({ ...entry, next, prev });
	})
	.get(
		'/:id/:level',
		zValidator(
			'param',
			z.object({
				id: z.string().regex(/^[0-9]*$/),
				level: z.union([z.literal('A1'), z.literal('A2'), z.literal('B1'), z.literal('B2'), z.literal('C1'), z.literal('C2')]),
			}),
		),
		async (c) => {
			const { id, level } = c.req.valid('param');

			let [calibratedEntry, entry, next, prev] = await Promise.all([
				getCalibratedEntryByEntryIdAndCefrLevel(c.env.DB, Number(id), level),
				getEntryById(c.env.DB, Number(id)),
				getNextEntry(c.env.DB, Number(id)),
				getPrevEntry(c.env.DB, Number(id)),
			]);
			if (!entry) throw new HTTPException(404, { message: 'Entry not found' });

			if (calibratedEntry) return c.json({ ...calibratedEntry, thumbnailUrl: entry.thumbnailUrl, next, prev });

			const res = await c.env.Calibrate.calibrateAndInsert(Number(id), level);

			return c.json({ ...res, thumbnailUrl: entry.thumbnailUrl, next, prev });
		},
	);

export type ApiEntry = typeof apiEntry;
