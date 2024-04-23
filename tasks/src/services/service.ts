import { KiribiPerformer } from 'kiribi/performer';
import { Env } from '../type';
import { drizzle, DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from '../../../src/schema';
import { OpenAI } from 'openai';
import GoogleAuth from 'cloudflare-workers-and-google-oauth';
import { ExecutionContext } from 'hono';

export abstract class Service<P extends unknown = any> extends KiribiPerformer<P, Env> {
	protected db: DrizzleD1Database<typeof schema>;
	protected openAi: OpenAI;
	protected bucket: R2Bucket;
	protected cache: KVNamespace;

	constructor(ctx: ExecutionContext, env: Env) {
		super(ctx, env);
		this.db = drizzle(env.DB, { schema });
		this.openAi = new OpenAI({
			apiKey: env.OPEN_AI_API_KEY,
			baseURL: 'https://gateway.ai.cloudflare.com/v1/940ed59491ce58430777f23d481336bb/eigo/openai',
		});
		this.bucket = env.BUCKET;
		this.cache = env.CACHE;
	}

	protected async getGoogleToken() {
		const scopes: string[] = ['https://www.googleapis.com/auth/cloud-platform'];
		const oauth = new GoogleAuth(JSON.parse(this.env.GOOGLE_AUTH), scopes);
		const token = await oauth.getGoogleAuthToken();
		if (!token) throw new Error('Failed to get token');

		return token;
	}
}
