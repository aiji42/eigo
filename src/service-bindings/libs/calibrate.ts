import OpenAI from 'openai';
import { CEFRLevel } from '../../schema';

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
	const openai = new OpenAI({
		apiKey: token,
		baseURL: 'https://gateway.ai.cloudflare.com/v1/940ed59491ce58430777f23d481336bb/eigo/openai',
	});

	const chatCompletion = await openai.chat.completions.create({
		model: 'gpt-4-0125-preview',
		response_format: { type: 'json_object' },
		messages: [
			{
				role: 'system',
				content: 'You are an advanced English text transformer skilled in producing structured, coherent passages.',
			},
			{
				role: 'user',
				content: `Transform the text below into a well-structured English passage with paragraphs clearly separated by line breaks. Ensure the text consists of ${minWords}-${maxWords} words, aligning with CEFR level ${level}. Divide the text into paragraphs, each with approximately 50 words, ensuring logical flow and coherence. Also, generate a suitable title and provide both in JSON format with keys 'content' and 'title'. Enforce the word count strictly and ensure logical paragraph division.\n'''''${text}\n'''''`,
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
