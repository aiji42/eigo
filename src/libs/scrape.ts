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
				if (ignorableParagraph(p)) return;
				paragraphs.push(p);
			});
	});

	return createContent(paragraphs);
};

const ignorableParagraph = (text: string) => {
	return text.split(' ').length <= 5 || !text.endsWith('.');
};
