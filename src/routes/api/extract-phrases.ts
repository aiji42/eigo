import { zValidator } from '@hono/zod-validator';
import z from 'zod';
import { Hono } from 'hono';
import { Bindings } from '../../bindings';

const app = new Hono<{ Bindings: Bindings }>();

export const apiExtractPhrases = app.post(
	'/',
	zValidator(
		'json',
		z.object({
			text: z.string(),
		}),
	),
	async (c) => {
		const { text } = c.req.valid('json');
		const res = await c.env.PhrasesExtractor.extract(text);

		return c.json(res);
	},
);

export type ApiExtractPhrases = typeof apiExtractPhrases;
