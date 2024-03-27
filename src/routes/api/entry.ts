import { getCalibratedEntryByEntryIdAndCefrLevel, getEntryById, getNextEntry, getPrevEntry, insertCalibratedEntry } from '../../libs/db';
import { HTTPException } from 'hono/http-exception';
import { zValidator } from '@hono/zod-validator';
import z from 'zod';
import { createCalibrate, serviceBindingsMock } from '../../libs/service-bindings';
import { createContent, joinSentences } from '../../libs/content';
import { CalibratedData } from '../../service-bindings/libs/calibrate';
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

			let [calibratedEntry, next, prev] = await Promise.all([
				getCalibratedEntryByEntryIdAndCefrLevel(c.env.DB, Number(id), level),
				getNextEntry(c.env.DB, Number(id)),
				getPrevEntry(c.env.DB, Number(id)),
			]);

			if (calibratedEntry) return c.json({ ...calibratedEntry, next, prev });

			const entry = await getEntryById(c.env.DB, Number(id));
			if (!entry) throw new HTTPException(404, { message: 'Entry not found' });

			const calibre = createCalibrate(serviceBindingsMock(c.env).Calibrate, c.req.raw.clone());
			const calibratedContent = await calibre({
				text: entry.content.map(joinSentences).join('\n\n'),
				level,
				minWords: 400,
				maxWords: 500,
				type: 'calibrate',
			});
			const data: CalibratedData = JSON.parse(calibratedContent);

			const paragraphs = data.content.split('\n');
			const content = await createContent(paragraphs);

			const res = await insertCalibratedEntry(c.env.DB, entry, level, data.title, content);

			return c.json({ ...res, next, prev });
		},
	);

export type ApiEntry = typeof apiEntry;
