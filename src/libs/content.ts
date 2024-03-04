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

export const createContent = async (paragraphs: string[]): Promise<Content> => {
	const segmenter = new Intl.Segmenter('en-US', { granularity: 'sentence' });

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

export const isTTSed = (content: Content) => {
	return content.flatMap(({ sentences }) => sentences).every(({ duration, offset }) => duration !== null && offset !== null);
};
