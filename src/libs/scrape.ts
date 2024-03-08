import * as cheerio from 'cheerio';
import { Content, createContent } from './content';

export const scrapeContent = async (url: string, selector: string): Promise<Content> => {
	const res = await fetch(url);
	const text = await res.text();
	const $ = cheerio.load(text);

	const paragraphs: string[] = [];
	$(selector).each((i, elem) => {
		$(elem)
			.text()
			.split('\n')
			.forEach((p) => {
				const trim = p.trim();
				if (!ignorableParagraph(trim)) paragraphs.push(trim);
			});
	});

	return createContent(paragraphs);
};

const ignorableParagraph = (text: string) => {
	return !text.endsWith('.');
};
