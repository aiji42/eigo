import { useEffect } from 'react';

export const useMediaSession = (
	{
		title,
		lgArtwork,
		smArtwork,
	}: { title: string | undefined; lgArtwork: string | undefined | null; smArtwork: string | undefined | null },
	{
		onNextTrack,
		onPrevTrack,
	}: {
		onNextTrack?: VoidFunction;
		onPrevTrack?: VoidFunction;
	} = {},
) => {
	useEffect(() => {
		if (!('mediaSession' in navigator)) return;

		const artwork: MediaMetadata['artwork'][number][] = [];
		if (smArtwork) artwork.push({ src: smArtwork, sizes: '96x96', type: 'image/jpeg' });
		if (lgArtwork) artwork.push({ src: lgArtwork, sizes: '128x128', type: 'image/jpeg' });

		navigator.mediaSession.metadata = new MediaMetadata({
			title: title,
			artist: 'eigo',
			artwork,
		});

		navigator.mediaSession.setActionHandler('nexttrack', () => {
			onNextTrack?.();
		});
		navigator.mediaSession.setActionHandler('previoustrack', () => {
			onPrevTrack?.();
		});

		return () => {
			navigator.mediaSession.setActionHandler('nexttrack', null);
			navigator.mediaSession.setActionHandler('previoustrack', null);
		};
	}, [title, smArtwork, lgArtwork, onNextTrack]);
};
