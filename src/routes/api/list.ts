import { zValidator } from '@hono/zod-validator';
import z from 'zod';
import { paginateEntries } from '../../libs/db';
import { Hono } from 'hono';
import { Bindings } from '../../bindings';

const app = new Hono<{ Bindings: Bindings }>();

export const apiList = app.get(
	'',
	zValidator(
		'query',
		z.object({
			offset: z
				.string()
				.regex(/^[0-9]*$/)
				.optional(),
			size: z
				.string()
				.regex(/^[0-9]*$/)
				.optional(),
		}),
	),
	async (c) => {
		const { offset = 0, size = 10 } = c.req.valid('query');
		const entries = await paginateEntries(c.env.DB, Number(size), Number(offset));

		return c.json(entries);
	},
);

export type ApiList = typeof apiList;
