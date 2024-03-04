import { Content } from './content';

export const createM3U = (content: Content, urlPrefix: string) => {
	const sentences = content.flatMap(({ sentences }) => sentences);

	const targetDuration = Math.ceil(Math.max(...sentences.map(({ duration }) => duration ?? 0)));
	return `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:${targetDuration}
#EXT-X-MEDIA-SEQUENCE:0
${sentences.map(({ key, duration }) => `#EXTINF:${duration ?? 0},\n${urlPrefix}/${key}/voice.mp3`).join('\n')}
#EXT-X-ENDLIST
`;
};
