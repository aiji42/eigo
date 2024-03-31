import { parseHTML } from 'linkedom';
import { Readability } from '@mozilla/readability';
import { Content, createContent } from './content';

export const scrapeContent = async (url: string): Promise<Content> => {
	const text = await fetch(url).then((res) => res.text());

	const { document } = parseHTML(text);
	const reader = new Readability(document);
	const article = reader.parse();

	if (!article) return createContent([]);

	const paragraphs = article.textContent
		.split('\n')
		.map((p) => p.trim())
		.filter(isValid);

	return createContent(paragraphs);
};

const isValid = (text: string) => {
	return !!text && text.endsWith('.');
};
