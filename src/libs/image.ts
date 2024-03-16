import { CalibratedEntry, Entry } from '../schema';

export const imageBucketKey = (entry: string | number) => {
	return `images/entry-${entry}/featured.webp`;
};

export const imageUrl = (entry: string | number) => {
	const bucketKey = imageBucketKey(entry);
	return import.meta.env.PROD ? `https://media.eigo.aiji42.com/${bucketKey}` : `/local-r2-pr?key=${bucketKey}`;
};

export const imageUrlByEntry = (entry: Entry | CalibratedEntry) => {
	if (entry.thumbnailUrl?.startsWith('images/')) {
		const id = 'entryId' in entry ? entry.entryId : entry.id;
		return imageUrl(id);
	}
	return entry.thumbnailUrl;
};

export const putImageOnBucket = async (bucket: R2Bucket, entryId: string | number, image: ArrayBuffer | Uint8Array) => {
	const bucketKey = imageBucketKey(entryId);
	await bucket.put(bucketKey, image);
	return bucketKey;
};
