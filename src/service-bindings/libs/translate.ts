type TranslateResponseData = {
	translations: {
		translatedText: string;
		detectedLanguageCode: string;
	}[];
};

export const translateByGoogle = async (token: string, text: string) => {
	const body = {
		contents: [text],
		targetLanguageCode: 'ja',
	};

	const res = await fetch('https://content-translation.googleapis.com/v3beta1/projects/sandbox-353309:translateText', {
		method: 'POST',
		body: JSON.stringify(body),
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	});

	if (!res.ok) throw new Error(await res.text());

	const {
		translations: [{ translatedText }],
	} = (await res.json()) as TranslateResponseData;

	return translatedText;
};
