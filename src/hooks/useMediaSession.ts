import { RefObject, useEffect } from 'react';

export const useMediaSession = (
	playerRef: RefObject<HTMLAudioElement>,
	{
		title,
		lgArtwork,
		smArtwork,
	}: { title: string | undefined; lgArtwork: string | undefined | null; smArtwork: string | undefined | null },
) => {
	useEffect(() => {
		if (!('mediaSession' in navigator) || !playerRef.current || !title) return;

		const artwork: MediaMetadata['artwork'][number][] = [];
		if (smArtwork) artwork.push({ src: smArtwork, sizes: '96x96', type: 'image/jpeg' });
		if (lgArtwork) artwork.push({ src: lgArtwork, sizes: '128x128', type: 'image/jpeg' });

		navigator.mediaSession.metadata = new MediaMetadata({
			title: title,
			artist: 'eigo',
			artwork,
		});

		navigator.mediaSession.setActionHandler('play', () => {
			playerRef.current?.play();
		});
		navigator.mediaSession.setActionHandler('pause', () => {
			playerRef.current?.pause();
		});
		navigator.mediaSession.setActionHandler('nexttrack', () => {
			// ページを送る
		});
		navigator.mediaSession.setActionHandler('previoustrack', () => {
			// ページを戻す
		});

		return () => {
			navigator.mediaSession.metadata = null;
			navigator.mediaSession.setActionHandler('play', null);
			navigator.mediaSession.setActionHandler('pause', null);
			navigator.mediaSession.setActionHandler('nexttrack', null);
			navigator.mediaSession.setActionHandler('previoustrack', null);
		};
	}, [title, smArtwork, lgArtwork, playerRef]);
};
