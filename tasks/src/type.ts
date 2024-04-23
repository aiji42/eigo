import { Kiribi } from 'kiribi';

export type Env = {
	CACHE: KVNamespace;
	DB: D1Database;
	BUCKET: R2Bucket;
	KIRIBI: Service<Kiribi>;
	OPEN_AI_API_KEY: string;
	IMAGE_HOST_PREFIX: string;
	VOICE_HOST_PREFIX: string;
	GOOGLE_AUTH: string;
};
