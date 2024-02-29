const mapping: Record<string, string> = { TTS: 'http://localhost:8050' };

export const serviceBindingsMock = <T extends Record<string, unknown>>(bindings: T) => {
	return new Proxy(bindings, {
		get(target: T, p: string, receiver: unknown): Fetcher {
			if (p in target) return Reflect.get(target, p, receiver) as Fetcher;

			const endpoint: string | undefined = mapping[p];
			if (!endpoint) throw new Error(`Called unknown Service: ${p}`);

			return { fetch: async (input: Request) => fetch(endpoint, input) } as unknown as Fetcher;
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
		const duration = Number(res.headers.get('X-Duration'));
		const audio = await res.arrayBuffer();
		return { duration, audio: new Uint8Array(audio) };
	};
