import { Service } from './service';

export class PhrasesExtractor extends Service {
	perform(): void | Promise<void> {
		console.log('no perform method');
	}

	public async extract(text: string) {
		const segmenter = new Intl.Segmenter('en-US', { granularity: 'word' });
		const wordsCount = Array.from(segmenter.segment(text)).filter((seg) => seg.isWordLike).length;

		// ex. "The U.S."
		if (wordsCount <= 3) return {};

		const chatCompletion = await this.openAi.chat.completions.create({
			model: wordsCount > 75 ? 'gpt-4-turbo' : 'gpt-3.5-turbo',
			response_format: { type: 'json_object' },
			messages: [
				{
					role: 'system',
					content:
						'You are an assistant specialized in English language learning. Pick up idioms and collocations that are important to understand a sentences in order of appearance, and output them in JSON format with the key as the key and the value as the meaning in 日本語.',
				},
				{
					role: 'user',
					content: text,
				},
			],
		});

		chatCompletion.choices[0].finish_reason;

		const {
			choices: [
				{
					finish_reason,
					message: { content },
				},
			],
		} = chatCompletion;

		if (finish_reason !== 'stop') throw new Error(`Extraction failed; finish_reason is ${finish_reason}`);
		if (!content) throw new Error(`Extraction failed; empty response`);

		const data = JSON.parse(content);

		assert(data);

		return data;
	}
}

export type ExtractedPhrases = Record<string, string>;

function assert(data: any): asserts data is ExtractedPhrases {
	if (Object(data) !== data) throw new Error(`Extraction failed; invalid response: ${data}`);
	Object.values(data).forEach((value) => {
		if (typeof value !== 'string') throw new Error(`Extraction failed; invalid response: ${data}`);
	});
}
