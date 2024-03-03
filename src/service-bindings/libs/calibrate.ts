type OpenAIResponseData = {
	choices: [
		{
			finish_reason: 'stop' | 'length' | 'function_call' | 'content_filter' | null;
			index: 0;
			message: {
				content: string;
				role: 'assistant';
			};
			logprobs: null;
		},
	];
	created: number;
	id: string;
	model: string;
	object: string;
	usage: {
		completion_tokens: number;
		prompt_tokens: number;
		total_tokens: number;
	};
};

export type CalibrateOption = {
	level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
	maxWords?: number;
	minWords?: number;
};

export const calibrateByOpenAI = async (
	token: string,
	text: string,
	{ level = 'A1', maxWords = 400, minWords = 300 }: CalibrateOption = {},
) => {
	const body = {
		model: 'gpt-4-0125-preview',
		response_format: { type: 'json_object' },
		messages: [
			{
				role: 'system',
				content: 'You are an excellent assistant in linguistics, especially English.',
			},
			{
				role: 'user',
				content: `Please convert the following English text into an English text consisting of ${minWords}-${maxWords} words at CEFR level ${level} and return it as JSON data with the key "calibrated". Please break up paragraphs appropriately and use line feed codes between paragraphs.\n'''''${text}\n'''''`,
			},
		],
	};

	const response = await fetch('https://api.openai.com/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(body),
	});

	if (!response.ok) throw new Error(await response.text());
	const {
		choices: [
			{
				finish_reason,
				message: { content },
			},
		],
	} = (await response.json()) as OpenAIResponseData;

	if (finish_reason !== 'stop') throw new Error(`Calibration failed; finish_reason is ${finish_reason}`);
	const { calibrated } = JSON.parse(content) as { calibrated: string };

	return calibrated;
};
