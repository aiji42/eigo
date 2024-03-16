import OpenAI from 'openai';
import { CEFRLevel } from '../../schema';
import { getOpenAI } from './openAI';

export type CalibrateOption = {
	level?: CEFRLevel;
	maxWords?: number;
	minWords?: number;
};

export type CalibratedData = { title: string; content: string };

export const calibrateByOpenAI = async (
	token: string,
	text: string,
	{ level = 'A1', maxWords = 400, minWords = 300 }: CalibrateOption = {},
): Promise<CalibratedData> => {
	const openai = getOpenAI(token);

	const chatCompletion = await openai.chat.completions.create({
		model: 'gpt-4-0125-preview',
		response_format: { type: 'json_object' },
		messages: [
			{
				role: 'system',
				content:
					'You are an advanced English text transformer capable of analyzing and adjusting text complexity according to CEFR guidelines.',
			},
			{
				role: 'user',
				content: `Transform the text below into a well-structured English passage with paragraphs clearly separated by line breaks. First, determine the current CEFR level of the text, then adjust it to strictly match CEFR level ${level}, ensuring the text consists of ${minWords}-${maxWords} words. Divide the text into paragraphs, each with approximately 50 words, maintaining logical flow and coherence throughout. Also, generate a suitable title and provide both in JSON format with keys 'content', 'title' and 'originalCEFR'. Strictly enforce the word count, ensure logical paragraph division, and adhere strictly to the specified CEFR level.\n'''''${text}\n'''''`,
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

	if (finish_reason !== 'stop') throw new Error(`Calibration failed; finish_reason is ${finish_reason}`);
	if (!content) throw new Error(`Calibration failed; empty response`);
	const data = JSON.parse(content);

	assert(data);

	return data;
};

function assert(data: any): asserts data is CalibratedData {
	if (!data || typeof data !== 'object') throw new Error(`Calibration failed; invalid response: ${data}`);
	if (!('title' in data && typeof data.title === 'string')) throw new Error(`Calibration failed; invalid response: ${data}`);
	if (!('content' in data && typeof data.content === 'string')) throw new Error(`Calibration failed; invalid response: ${data}`);
}
