import * as cheerio from 'cheerio';
import { sha256 } from './utils';
import { Ai } from '@cloudflare/ai';

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
	translation: string;
	duration: number | null;
	offset: number | null;
};

const segmenter = new Intl.Segmenter('en-US', { granularity: 'sentence' });

export const scrapeContent = async (url: string, selector: string, ai: Ai): Promise<Content> => {
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
						translation: await translate(ai, segment),
						duration: null,
						offset: null,
					};
				}),
			),
		})),
	);
};

const translate = async (ai: Ai, text: string) => {
	const res = await ai.run('@cf/meta/m2m100-1.2b', {
		text,
		target_lang: 'ja',
		source_lang: 'en',
	});
	return res.translated_text;
};

const ignorableParagraph = (text: string) => {
	return text.split(' ').length <= 5 || !text.endsWith('.');
};
