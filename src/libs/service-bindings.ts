const mapping: Record<string, string> = {
	TTS: 'http://localhost:8050',
	Translate: 'http://localhost:8051',
	Calibrate: 'http://localhost:8052',
};

export const serviceBindingsMock = <T extends Record<string, unknown>>(bindings: T) => {
	return new Proxy(bindings, {
		get(target: T, p: string, receiver: unknown): Fetcher {
			if (import.meta.env.PROD && p in target) return Reflect.get(target, p, receiver) as Fetcher;

			const endpoint: string | undefined = mapping[p];
			if (!endpoint) throw new Error(`Called unknown Service: ${p}`);

			return {
				fetch: async (input: Request) => {
					return fetch(endpoint, {
						method: input.method,
						body: input.body,
						headers: input.headers,
						// @ts-ignore
						duplex: 'half',
					});
				},
			} as unknown as Fetcher;
		},
	});
};

export const createTTS =
	(fetcher: Fetcher, req: Request) =>
	async (text: string, cloned = false) => {
		const newReq = new Request(cloned ? req : req.clone(), {
			method: 'POST',
			body: JSON.stringify({ text }),
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const res = await fetcher.fetch(newReq);
		if (!res.ok) throw new Error(await res.text());
		const duration = Number(res.headers.get('X-Duration'));
		const audio = await res.arrayBuffer();
		return { duration, audio: new Uint8Array(audio) };
	};

export const createTranslate =
	(fetcher: Fetcher, req: Request) =>
	async (text: string, cloned = false) => {
		const newReq = new Request(cloned ? req : req.clone(), {
			method: 'POST',
			body: JSON.stringify({ text }),
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const res = await fetcher.fetch(newReq);
		if (!res.ok) throw new Error(await res.text());
		return res.text();
	};

export const createCalibrate =
	(fetcher: Fetcher, req: Request) =>
	async (text: string, cloned = false) => {
		const newReq = new Request(cloned ? req : req.clone(), {
			method: 'POST',
			body: JSON.stringify({ text }),
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const res = await fetcher.fetch(newReq);
		if (!res.ok) throw new Error(await res.text());
		return res.text();
	};
