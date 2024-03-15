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

	const content = await Promise.all(
		paragraphs.map<Promise<Paragraph | null>>(async (p) => {
			const paragraph = p.trim();
			if (!paragraph) return null;
			return {
				type: 'paragraph',
				key: await sha256(paragraph),
				duration: null,
				offset: null,
				sentences: await Promise.all(
					Array.from(segmenter.segment(paragraph)).map(async ({ segment: s }) => {
						const segment = s.trim();
						return {
							type: 'sentence',
							key: await sha256(segment),
							text: segment,
							duration: null,
							offset: null,
						};
					}),
				),
			};
		}),
	);

	return content.filter((c): c is Paragraph => c !== null);
};

export const isTTSed = (content: Content) => {
	return content.flatMap(({ sentences }) => sentences).every(({ duration, offset }) => duration !== null && offset !== null);
};

export const getTotalDuration = (content: Content) => {
	return content.reduce((acc, { duration }) => (duration ?? 0) + acc, 0);
};

export const getTotalWordsCount = (content: Content) => {
	const segmenter = new Intl.Segmenter('en-US', { granularity: 'word' });
	return content.flatMap(({ sentences }) => sentences).reduce((acc, { text }) => acc + Array.from(segmenter.segment(text)).length, 0);
};

export const joinSentences = (paragraph: Paragraph) => {
	return paragraph.sentences.map(({ text }) => text).join(' ');
};

export const getPlaying = (content: Content, currentTime: number) => {
	const paragraph = content.find(
		({ offset, duration }) => (offset ?? -1) <= currentTime && currentTime <= (offset ?? -1) + (duration ?? 0),
	);
	const sentence = paragraph?.sentences.find(
		({ offset, duration }) => (offset ?? -1) <= currentTime && currentTime <= (offset ?? -1) + (duration ?? 0),
	);

	return { paragraph, sentence };
};

export const getNextPlaybackTime = (content: Content, currentTime: number, segment: 'sentence' | 'paragraph' = 'paragraph') => {
	const { paragraph, sentence } = getPlaying(content, currentTime);
	if (!sentence || !paragraph) return -1;
	if (sentence.offset === null || paragraph.offset === null) return 0;

	const sentences = content.flatMap(({ sentences }) => sentences);
	const index =
		segment === 'sentence' ? sentences.findIndex(({ key }) => sentence.key === key) : content.findIndex(({ key }) => paragraph.key === key);
	const next = segment === 'sentence' ? sentences[index + 1] : content[index + 1];

	return next?.offset ?? -1;
};

export const getPrevPlaybackTime = (
	content: Content,
	currentTime: number,
	segment: 'sentence' | 'paragraph' = 'sentence',
	threshold = 2,
) => {
	const { sentence, paragraph } = getPlaying(content, currentTime);
	if (!sentence || !paragraph || sentence.offset === null || paragraph.offset === null) return 0;

	// 現在再生中のセグメントが開始位置からthreshold秒以内なら、それを返す
	if (segment === 'sentence' && sentence.offset + threshold < currentTime) return sentence.offset;
	if (segment === 'paragraph' && paragraph.offset + threshold < currentTime) return paragraph.offset;

	const sentences = content.flatMap(({ sentences }) => sentences);

	const index =
		segment === 'sentence' ? sentences.findIndex(({ key }) => sentence.key === key) : content.findIndex(({ key }) => paragraph.key === key);
	const prev = segment === 'sentence' ? sentences[index - 1] : content[index - 1];

	return prev?.offset ?? -1;
};
