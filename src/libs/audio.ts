// TODO: ピッチや声、速度によってキーを変える
import { CalibratedEntry, Entry } from '../schema';

export const audioBucketKey = (entryId: string | number, sentenceKey: string) => {
	return `voices/entry-${entryId}/normal/${sentenceKey}.mp3`;
};

export const audioUrl = (entryId: string | number, sentenceKey: string) => {
	const bucketKey = audioBucketKey(entryId, sentenceKey);
	return import.meta.env.PROD ? `https://media.eigo.aiji42.com/${bucketKey}` : `/local-r2-pr?key=${bucketKey}`;
};

export const existsAudioOnBucket = async (bucket: R2Bucket, entryId: string | number, sentenceKey: string) => {
	const object = await bucket.head(audioBucketKey(entryId, sentenceKey));
	return !!object;
};

export const putAudioOnBucket = async (
	bucket: R2Bucket,
	entryId: string | number,
	sentenceKey: string,
	audio: Uint8Array,
	metadata: { duration: number },
) => {
	return bucket.put(audioBucketKey(entryId, sentenceKey), audio, { customMetadata: { duration: String(metadata.duration) } });
};

export const createM3U = (entry: Entry | CalibratedEntry) => {
	const sentences = entry.content.flatMap(({ sentences }) => sentences);
	const id = 'entryId' in entry ? entry.entryId : entry.id;

	const targetDuration = Math.ceil(Math.max(...sentences.map(({ duration }) => duration ?? 0)));
	return `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:${targetDuration}
#EXT-X-MEDIA-SEQUENCE:0
${sentences.map(({ key, duration }) => `#EXTINF:${duration ?? 0},\n${audioUrl(id, key)}`).join('\n')}
#EXT-X-ENDLIST
`;
};
