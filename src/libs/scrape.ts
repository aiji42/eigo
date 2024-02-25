import * as cheerio from 'cheerio';
import { sha256 } from './utils';

export type Content = Paragraph[];

export type Paragraph = {
	type: 'paragraph';
	key: string;
	duration: number | null;
	offset: number | null;
	sentences: Sentence[];
};

export type Sentence = {
	type: 'sentence';
	key: string;
	text: string;
	duration: number | null;
	offset: number | null;
};

const segmenter = new Intl.Segmenter('en-US', { granularity: 'sentence' });

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

	return await Promise.all(
		paragraphs.map(async (paragraph) => ({
			type: 'paragraph',
			key: await sha256(paragraph),
			duration: null,
			offset: null,
			sentences: await Promise.all(
				Array.from(segmenter.segment(paragraph)).map(async ({ segment }) => {
					return {
						type: 'sentence',
						key: await sha256(segment),
						text: segment,
						duration: null,
						offset: null,
					};
				}),
			),
		})),
	);
};

const ignorableParagraph = (text: string) => {
	return text.split(' ').length <= 5 || !text.endsWith('.');
};
