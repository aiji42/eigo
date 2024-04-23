import { Service } from './service';
import { CEFRLevel } from '../../../src/schema';
import { Content, isTTSed, Paragraph, Sentence } from '../../../src/libs/content';
import { base64ToUint8Array, sha256 } from '../../../src/libs/utils';
import { parseBuffer as mmParseBuffer } from 'music-metadata/lib/core';
import * as schema from '../../../src/schema';
import { eq } from 'drizzle-orm';

export type TTSResponseData = {
	audioContent: string;
	timepoints: {
		markName: string;
		timeSeconds: number;
	}[];
	audioConfig: {
		audioEncoding: string;
		speakingRate: number;
		pitch: number;
		volumeGainDb: number;
		sampleRateHertz: number;
		effectsProfileId: string[];
	};
};

export class PlaylistMaker extends Service {
	async perform() {
		console.log('no async function here');
	}

	public async make({ entryId, level }: { entryId: number; level: CEFRLevel | null }) {
		const entry = level
			? await this.db.query.calibratedEntries.findFirst({
					where: (record, { eq, and }) => and(eq(record.entryId, entryId), eq(record.cefrLevel, level)),
				})
			: await this.db.query.entries.findFirst({
					where: (record, { eq }) => eq(record.id, entryId),
				});

		if (!entry) throw new Error('Entry not found');

		if (isTTSed(entry.content)) return { m3u: await this.createM3U(entryId, entry.content) };

		const { newContent, audios } = await this.ttsContent(entry.content);
		await Promise.all(audios.map(async ({ audio, key, duration }) => this.putAudioOnBucket(entryId, key, audio, { duration })));

		if (level)
			await this.db
				.update(schema.calibratedEntries)
				.set({ content: newContent })
				.where(eq(schema.calibratedEntries.id, entry.id))
				.execute();
		else await this.db.update(schema.entries).set({ content: newContent }).where(eq(schema.entries.id, entry.id)).execute();

		return { m3u: await this.createM3U(entryId, newContent) };
	}

	private async tts(text: string, voice: string) {
		const cacheKey = `tts:${await sha256(text)}:${voice}`;
		const cacheData = await this.cache.get(cacheKey, 'arrayBuffer');
		if (cacheData) return new Uint8Array(cacheData);

		const body = {
			audioConfig: {
				audioEncoding: 'MP3_64_KBPS',
				effectsProfileId: ['headphone-class-device'],
				pitch: 1,
				speakingRate: 0.85,
			},
			input: {
				text,
			},
			voice: {
				languageCode: 'en-US',
				name: voice,
			},
		};

		const res = await fetch('https://us-central1-texttospeech.googleapis.com/v1beta1/text:synthesize', {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${await this.getGoogleToken()}`,
			},
		});

		if (!res.ok) throw new Error(await res.text());

		const { audioContent } = (await res.json()) as TTSResponseData;
		const audio = base64ToUint8Array(audioContent);

		await this.cache.put(cacheKey, audio);

		return audio;
	}

	private async ttsContent(content: Content) {
		const sentences = content.flatMap(({ sentences }) => sentences);
		const audios = await Promise.all(
			sentences.map(async (sentence) => {
				const audio = await this.tts(sentence.text, 'en-US-Neural2-E');
				const duration = await this.inspectDuration(audio);
				return { key: sentence.key, audio, duration };
			}),
		);
		const mapping = Object.fromEntries(audios.map((data) => [data.key, data]));

		let offset = 0;
		const newContent = content.map((paragraph) => {
			const sentences = paragraph.sentences.map((sentence) => {
				const duration = mapping[sentence.key].duration;
				const newSentence = {
					type: 'sentence',
					key: sentence.key,
					text: sentence.text,
					duration,
					offset,
				} satisfies Sentence;

				offset = offset + duration;

				return newSentence;
			});

			const duration = sentences.reduce((acc, { duration }) => acc + duration, 0);
			return {
				type: 'paragraph',
				key: paragraph.key,
				// newSentenceの計算でoffsetはすでに加算されてしまっている
				offset: offset - duration,
				duration,
				sentences,
			} satisfies Paragraph;
		}) satisfies Content;

		return { newContent, audios };
	}

	private async inspectDuration(audio: Uint8Array) {
		const { format } = await mmParseBuffer(audio);
		return format.duration ?? -1;
	}

	private async putAudioOnBucket(entryId: number, key: string, audio: Uint8Array, metadata: { duration: number }) {
		return this.bucket.put(this.audioBucketKey(entryId, key), audio, { customMetadata: { duration: String(metadata.duration) } });
	}

	private async createM3U(id: number, content: Content) {
		const sentences = content.flatMap(({ sentences }) => sentences);

		const targetDuration = Math.ceil(Math.max(...sentences.map(({ duration }) => duration ?? 0)));
		return `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:${targetDuration}
#EXT-X-MEDIA-SEQUENCE:0
${sentences.map(({ key, duration }) => `#EXTINF:${duration ?? 0},\n${this.audioUrl(id, key)}`).join('\n')}
#EXT-X-ENDLIST
`;
	}

	private audioBucketKey(entryId: string | number, sentenceKey: string) {
		return `voices/entry-${entryId}/normal/${sentenceKey}.mp3`;
	}

	private audioUrl(entryId: string | number, sentenceKey: string) {
		const bucketKey = this.audioBucketKey(entryId, sentenceKey);
		return `${this.env.VOICE_HOST_PREFIX}${bucketKey}`;
	}
}
