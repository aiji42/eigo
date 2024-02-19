import { TTSResponseData } from './tts';
import { base64ToUint8Array } from './utils';

export const getAudioByCache = async (key: string, cache: KVNamespace) => {
	const data = await cache.get<TTSResponseData>(key, 'json');
	if (!data) throw new Error('Cache not found');
	return base64ToUint8Array(data.audioContent);
};
