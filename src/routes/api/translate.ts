import { Hono } from 'hono';
import { Bindings } from '../../bindings';
import { createTranslate, serviceBindingsMock } from '../../libs/service-bindings';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const app = new Hono<{ Bindings: Bindings }>();

export const apiTranslate = app.post('', zValidator('json', z.object({ text: z.string() })), async (c) => {
	const { text } = c.req.valid('json');
	const translate = createTranslate(serviceBindingsMock(c.env).Translate, c.req.raw);

	// ルートの何処かですでにリクエストがクローンされている
	return c.json({ translated: await translate(text, true) });
});

export type ApiTranslate = typeof apiTranslate;
