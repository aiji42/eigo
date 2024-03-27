import { zValidator } from '@hono/zod-validator';
import z from 'zod';
import { getCalibratedEntryByEntryIdAndCefrLevel, getEntryById } from '../../libs/db';
import { Hono } from 'hono';
import { Bindings } from '../../bindings';
import { joinSentences } from '../../libs/content';
import { createExtractPhrases, serviceBindingsMock } from '../../libs/service-bindings';
import { HTTPException } from 'hono/http-exception';

const app = new Hono<{ Bindings: Bindings }>();

export const apiExtractPhrases = app.get(
	'/:id',
	zValidator(
		'query',
		z.object({
			level: z.union([z.literal('A1'), z.literal('A2'), z.literal('B1'), z.literal('B2'), z.literal('C1'), z.literal('C2')]).optional(),
		}),
	),
	async (c) => {
		const id = c.req.param('id');
		const level = c.req.valid('query').level;

		let text = '';

		if (level) {
			const calibratedEntry = await getCalibratedEntryByEntryIdAndCefrLevel(c.env.DB, Number(id), level);
			if (!calibratedEntry) throw new HTTPException(404, { message: 'Entry not found' });

			text = calibratedEntry.content.flatMap(joinSentences).join('\n');
		} else {
			const entry = await getEntryById(c.env.DB, Number(id));
			if (!entry) throw new HTTPException(404, { message: 'Entry not found' });

			text = entry.content.flatMap(joinSentences).join('\n');
		}

		const extractPhrases = createExtractPhrases(serviceBindingsMock(c.env).Calibrate, c.req.raw.clone());
		const phrases = await extractPhrases({ text, type: 'extract-phrases' });

		return c.json(phrases);
	},
);

export type ApiExtractPhrases = typeof apiExtractPhrases;
