import { Service } from './service';
import { CEFRLevel } from '../../../src/schema';
import { Content, createContent, joinSentences } from '../../../src/libs/content';
import * as schema from '../../../src/schema';

export class Calibrator extends Service<{ entryId: number; level: CEFRLevel }> {
	async perform({ entryId, level }: { entryId: number; level: CEFRLevel }) {
		await this.calibrateAndInsert(entryId, level);
	}

	public async calibrateAndInsert(
		entryId: number,
		level: CEFRLevel,
	): Promise<{
		id: number;
		cefrLevel: CEFRLevel;
		title: string;
		content: Content;
		thumbnailUrl: string | null;
		createdAt: Date;
		entryId: number;
	}> {
		const entry = await this.db.query.entries.findFirst({ where: (record, { eq }) => eq(record.id, entryId) });

		if (!entry) throw new Error('entry not found');

		const data = await this.calibrate(entry.content.map(joinSentences).join('\n\n'), level, 400, 500);

		const paragraphs = data.content.split('\n');
		const content = await createContent(paragraphs);

		const [calibrated] = await this.db
			.insert(schema.calibratedEntries)
			.values({
				entryId,
				cefrLevel: level,
				title: data.title,
				content,
				createdAt: new Date(),
			})
			.onConflictDoUpdate({ target: [schema.calibratedEntries.entryId, schema.calibratedEntries.cefrLevel], set: { content } })
			.returning();

		return calibrated;
	}

	private async calibrate(text: string, level: CEFRLevel, minWords: number, maxWords: number) {
		const chatCompletion = await this.openAi.chat.completions.create({
			model: 'gpt-4-turbo',
			response_format: { type: 'json_object' },
			messages: [
				{
					role: 'system',
					content:
						'You are an advanced English text transformer capable of analyzing and adjusting text complexity according to CEFR guidelines.',
				},
				{
					role: 'user',
					content: `Transform the text below into a well-structured English passage with paragraphs clearly separated by line breaks. First, determine the current CEFR level of the text, then adjust it to strictly match CEFR level ${level}, ensuring the text consists of ${minWords}-${maxWords} words. Divide the text into paragraphs, each with approximately 50 words, maintaining logical flow and coherence throughout. Also, generate a suitable title and provide both in JSON format with keys 'content', 'title' and 'originalCEFR'. Strictly enforce the word count, ensure logical paragraph division, and adhere strictly to the specified CEFR level.\n'''''${text}\n'''''`,
				},
			],
		});

		const {
			choices: [
				{
					finish_reason,
					message: { content },
				},
			],
		} = chatCompletion;

		if (finish_reason !== 'stop') throw new Error(`Calibration failed; finish_reason is ${finish_reason}`);
		if (!content) throw new Error(`Calibration failed; empty response`);
		const data = JSON.parse(content);

		assert(data);

		return data;
	}
}

type CalibratedData = { title: string; content: string };

function assert(data: any): asserts data is CalibratedData {
	if (!data || typeof data !== 'object') throw new Error(`Calibration failed; invalid response: ${data}`);
	if (!('title' in data && typeof data.title === 'string')) throw new Error(`Calibration failed; invalid response: ${data}`);
	if (!('content' in data && typeof data.content === 'string')) throw new Error(`Calibration failed; invalid response: ${data}`);
}
