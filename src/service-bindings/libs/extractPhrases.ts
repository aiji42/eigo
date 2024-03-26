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
					"You are an assistant specialized in analyzing texts with a focus on identifying challenging content for advanced language learners, excluding generic proper nouns such as personal names, company names, and other specific entities with low general relevance. Your task is to scrutinize the provided text to find phrases that are considered difficult because of their complexity, rarity, or significant cultural, academic, or technical depth. For each identified phrase, you will output the information in a JSON format. This includes the phrase under 'target', its meaning in Japanese under 'meaning', and classifying the type of phrase ('word', 'collocation', or 'idiom') under 'type'. Ensure the JSON object contains a key named 'phrases', which should hold an array of objects. Each object represents a challenging phrase with detailed descriptions as specified. Focus your analysis on elements that would be challenging for an audience with advanced proficiency, specifically avoiding basic vocabulary, common expressions, and irrelevant proper nouns.",
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
