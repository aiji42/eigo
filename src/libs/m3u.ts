export const createM3U = (audios: { key: string; duration: number }[]) => {
	const targetDuration = Math.ceil(Math.max(...audios.map(({ duration }) => duration)));
	return `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:${targetDuration}
#EXT-X-MEDIA-SEQUENCE:0
${audios.map(({ key, duration }) => `#EXTINF:${duration},\n/audio/${key}.mp3`).join('\n')}
#EXT-X-ENDLIST
`;
};
