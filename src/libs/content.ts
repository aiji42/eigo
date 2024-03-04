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

export const getNextPlayableSentence = (content: Content, currentTime: number) => {
	const playingKey = getPlaying(content, currentTime).sentence?.key;
	const sentences = content.flatMap(({ sentences }) => sentences);

	if (!playingKey) return null;

	const index = sentences.findIndex(({ key }) => playingKey === key);
	return sentences[Math.min(sentences.length - 1, index + 1)] ?? null;
};

export const getPrevPlayableSentence = (content: Content, currentTime: number, threshold = 2) => {
	const playing = getPlaying(content, currentTime);
	// 現在再生中のセンテンスが開始位置からthreshold秒以内なら、それを返す
	if (playing && (playing.sentence?.offset ?? 0) + threshold < currentTime) return playing.sentence;

	const sentences = content.flatMap(({ sentences }) => sentences);

	const playingKey = playing.sentence?.key;
	if (!playingKey) return null;

	const index = sentences.findIndex(({ key }) => playingKey === key);
	return sentences[Math.max(0, index - 1)] ?? null;
};
