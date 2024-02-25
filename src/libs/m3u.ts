import { entries } from '../schema';
import { InferSelectModel } from 'drizzle-orm';

export const createM3U = (entry: InferSelectModel<typeof entries>) => {
	const sentences = entry.content.flatMap(({ sentences }) => sentences);

	const targetDuration = Math.ceil(Math.max(...sentences.map(({ duration }) => duration ?? 0)));
	return `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:${targetDuration}
#EXT-X-MEDIA-SEQUENCE:0
${sentences.map(({ key, duration }) => `#EXTINF:${duration ?? 0},\n/audio/${entry.id}/${key}/voice.mp3`).join('\n')}
#EXT-X-ENDLIST
`;
};
