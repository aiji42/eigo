export const imageBucketKey = (entry: string | number) => {
	return `images/entry-${entry}/featured.webp`;
};

export const putImageOnBucket = async (bucket: R2Bucket, entryId: string | number, image: ArrayBuffer | Uint8Array) => {
	const bucketKey = imageBucketKey(entryId);
	await bucket.put(bucketKey, image);
	return bucketKey;
};
