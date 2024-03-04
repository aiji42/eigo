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

export const joinSentences = (paragraph: Paragraph) => {
	return paragraph.sentences.map(({ text }) => text).join(' ');
};

export const getPlaying = (content: Content, currentTime: number) => {
	const paragraph = content.find(({ offset, duration }) => (offset ?? -1) <= currentTime && currentTime < (offset ?? -1) + (duration ?? 0));
	const sentence = paragraph?.sentences.find(
		({ offset, duration }) => (offset ?? -1) <= currentTime && currentTime < (offset ?? -1) + (duration ?? 0),
	);

	return { paragraph, sentence };
};

export const getNextPlayable = (content: Content, currentTime: number) => {
	const playing = getPlaying(content, currentTime).sentence?.key;
	const sentences = content.flatMap(({ sentences }) => sentences);

	if (!playing) return null;

	const index = sentences.findIndex(({ key }) => playing === key);
	if (index < 0) return null;
	return sentences[index] ?? null;
};

export const getPrevPlayable = (content: Content, currentTime: number) => {
	const playing = getPlaying(content, currentTime).sentence?.key;
	const sentences = content.flatMap(({ sentences }) => sentences);

	if (!playing) return null;

	const index = sentences.findIndex(({ key }) => playing === key);
	if (index <= 0) return null;
	return sentences[index - 1] ?? null;
};
