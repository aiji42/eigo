import { Content, Paragraph, Sentence } from './content';

export const ttsContent = async (tts: (text: string) => Promise<{ audio: Uint8Array; duration: number }>, content: Content) => {
	const sentences = content.flatMap(({ sentences }) => sentences);
	const audios = await Promise.all(
		sentences.map(async (sentence) => {
			return { key: sentence.key, ...(await tts(sentence.text)) };
		}),
	);
	const mapping = Object.fromEntries(audios.map((data) => [data.key, data]));

	let offset = 0;
	const newContent = content.map((paragraph) => {
		const sentences = paragraph.sentences.map((sentence) => {
			const duration = mapping[sentence.key].duration;
			const newSentence = {
				type: 'sentence',
				key: sentence.key,
				text: sentence.text,
				duration,
				offset,
			} satisfies Sentence;

			offset = offset + duration;

			return newSentence;
		});

		const duration = sentences.reduce((acc, { duration }) => acc + duration, 0);
		return {
			type: 'paragraph',
			key: paragraph.key,
			// newSentenceの計算でoffsetはすでに加算されてしまっている
			offset: offset - duration,
			duration,
			sentences,
		} satisfies Paragraph;
	}) satisfies Content;

	return { newContent, audios };
};
