import { getOpenAI } from './openAI';
import { optimizeImage } from 'wasm-image-optimization';

export const generateFeaturedImg = async (token: string, text: string): Promise<Uint8Array> => {
	const openAI = getOpenAI(token);

	const res = await openAI.images.generate({
		model: 'dall-e-3',
		prompt: `Please generate a live-action-like feature image based on the following news article.\n'''''${text}\n'''''`,
		n: 1,
		size: '1792x1024',
		response_format: 'b64_json',
		style: 'natural',
	});
	const base64 = res.data[0].b64_json!;
	const raw = atob(base64);
	const uint8Array = new Uint8Array(raw.length);
	for (let i = 0; i < raw.length; i++) {
		uint8Array[i] = raw.charCodeAt(i);
	}

	const optimized = await optimizeImage({ image: uint8Array, quality: 70, format: 'webp' });
	if (!optimized) throw new Error('failed to optimize image');
	return optimized;
};
