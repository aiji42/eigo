import { getOpenAI } from './openAI';

export type Phrase = {
	target: string;
	meaning: string;
	type: 'word' | 'collocation' | 'idiom';
};

export type ExtractedPhrases = {
	phrases: Phrase[];
};

export const extractPhrases = async (token: string, text: string): Promise<Phrase[]> => {
	const openAI = getOpenAI(token);

	const chatCompletion = await openAI.chat.completions.create({
		model: 'gpt-4-0125-preview',
		response_format: { type: 'json_object' },
		messages: [
			{
				role: 'system',
				content:
					"You are an assistant specialized in text analysis, tasked with identifying phrases that present a substantial challenge due to their advanced linguistic complexity, specialized cultural, academic, or technical references. Exclude proper nouns such as personal names and company names. Focus on identifying difficult words, idioms, or collocations that are not typically encountered in everyday language or basic educational materials. For each identified phrase, output the information in a JSON format, detailing the phrase under 'target', its meaning in Japanese under 'meaning', and classifying the type of phrase ('word', 'collocation', or 'idiom') under 'type'. The JSON object must include a key named 'phrases', containing an array of objects, each representing a phrase with detailed descriptions as specified. Aim to exclude content that would be considered basic or intermediate, ensuring the analysis prioritizes phrases that would be challenging even for those with a high level of proficiency.",
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

	return data.phrases;
};

function assert(data: any): asserts data is ExtractedPhrases {
	if (!data || typeof data !== 'object') throw new Error(`Extraction failed; invalid response: ${data}`);
	if (!('phrases' in data && Array.isArray(data.phrases))) throw new Error(`Extraction failed; invalid response: ${data}`);
	for (const phrase of data.phrases) {
		if (!phrase || typeof phrase !== 'object') throw new Error(`Extraction failed; invalid response: ${data}`);
		if (!('target' in phrase && typeof phrase.target === 'string')) throw new Error(`Extraction failed; invalid response: ${data}`);
		if (!('meaning' in phrase && typeof phrase.meaning === 'string')) throw new Error(`Extraction failed; invalid response: ${data}`);
		if (!('type' in phrase && typeof phrase.type === 'string')) throw new Error(`Extraction failed; invalid response: ${data}`);
		if (!['word', 'collocation', 'idiom'].includes(phrase.type)) throw new Error(`Extraction failed; invalid response: ${data}`);
	}
	return data;
}
