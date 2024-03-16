import OpenAI from 'openai';

export const getOpenAI = (token: string) => {
	return new OpenAI({
		apiKey: token,
		baseURL: 'https://gateway.ai.cloudflare.com/v1/940ed59491ce58430777f23d481336bb/eigo/openai',
	});
};
