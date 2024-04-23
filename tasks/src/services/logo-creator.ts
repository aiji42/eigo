import { optimizeImage } from 'wasm-image-optimization';
import { Service } from './service';
import * as schema from '../../../src/schema';
import { eq } from 'drizzle-orm';

export class LogoCreator extends Service<number> {
	async perform(entryId: number) {
		const entry = await this.db.query.entries.findFirst({ where: (record, { eq }) => eq(record.id, entryId) });
		if (!entry) return;

		const text = [entry.title, entry.content[0]].join('\n');
		const thumbnail = await this.create(text);
		const key = imageBucketKey(entryId);
		await this.bucket.put(key, thumbnail);

		await this.db
			.update(schema.entries)
			.set({ thumbnailUrl: `${this.env.IMAGE_HOST_PREFIX}${key}` })
			.where(eq(schema.entries.id, entryId))
			.execute();
	}

	private async create(text: string) {
		const targets = ['die-cut sticker'];
		const background = ['vivid monochromatic', 'vibrant monochromatic', 'bright monochromatic'];

		const res = await this.openAi.images.generate({
			model: 'dall-e-3',
			prompt: `Generate data for a cute and pop ${targets[Math.floor(Math.random() * targets.length)]} on a ${
				background[Math.floor(Math.random() * background.length)]
			} background associated with this text. \n'''''${text}\n'''''`,
			n: 1,
			size: '1792x1024',
			response_format: 'b64_json',
		});
		const base64 = res.data[0].b64_json!;
		const raw = atob(base64);
		const uint8Array = new Uint8Array(raw.length);
		for (let i = 0; i < raw.length; i++) {
			uint8Array[i] = raw.charCodeAt(i);
		}

		const optimized = await optimizeImage({ image: uint8Array, quality: 70, format: 'webp' });
		if (!optimized) throw new Error('failed to optimize image');
		return optimized;
	}
}

const imageBucketKey = (entry: string | number) => {
	return `images/entry-${entry}-${new Date().getTime()}/featured.webp`;
};
