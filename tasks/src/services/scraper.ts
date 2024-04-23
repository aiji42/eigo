import { Readability } from '@mozilla/readability';
import { parseHTML } from 'linkedom';
import { createContent } from '../../../src/libs/content';
import { Service } from './service';
import * as schema from '../../../src/schema';

export class Scraper extends Service<{ channelId: number; url: string }> {
	async perform({ channelId, url }: { channelId: number; url: string }) {
		const exists = await this.db.query.entries.findFirst({ where: (record, { eq }) => eq(record.url, url) }).then((res) => !!res);
		if (exists) return;

		const article = await scrape(url);
		if (!article) return;

		const paragraphs = getParagraphs(article.textContent);
		// パラグラフが少ない場合は保存しない
		if (paragraphs.length < 4) return;

		const content = await createContent(paragraphs);

		const [entry] = await this.db
			.insert(schema.entries)
			.values({
				channelId,
				url,
				title: article.title,
				description: article.excerpt,
				content,
				thumbnailUrl: null,
				metadata: null,
				publishedAt: new Date(article.publishedTime),
			})
			.returning();

		await this.env.KIRIBI.enqueue('LOGO_CREATOR', entry.id);
		await this.env.KIRIBI.enqueue('CALIBRATOR', { entryId: entry.id, level: 'A2' });
	}
}

const scrape = async (url: string): Promise<ReturnType<Readability['parse']>> => {
	const text = await fetch(url).then((res) => res.text());

	const { document } = parseHTML(text);
	const reader = new Readability(document);
	return reader.parse();
};

const getParagraphs = (text: string) => {
	return text
		.split('\n')
		.map((p) => p.trim())
		.filter(isValid);
};

const isValid = (text: string) => {
	return !!text && text.endsWith('.');
};
