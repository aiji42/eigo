import { RefObject, useEffect } from 'react';

export const useMediaSession = (
	playerRef: RefObject<HTMLAudioElement>,
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

		// MEMO: ステータスがpausedなときは、イヤホンを2回タップしてもnexttrackは発火せず、代わりにplayが発火する
		navigator.mediaSession.setActionHandler('play', () => {
			playerRef.current?.play();
		});
		navigator.mediaSession.setActionHandler('pause', () => {
			playerRef.current?.pause();
		});
		navigator.mediaSession.setActionHandler('nexttrack', () => {
			onNextTrack?.();
		});
		navigator.mediaSession.setActionHandler('previoustrack', () => {
			onPrevTrack?.();
		});

		const play = () => (navigator.mediaSession.playbackState = 'playing');
		const pause = () => (navigator.mediaSession.playbackState = 'paused');
		const setPositionState = () =>
			navigator.mediaSession.setPositionState({
				// durationはNaNになりえる
				duration: playerRef.current?.duration || 0,
				playbackRate: playerRef.current?.playbackRate ?? 1,
				position: playerRef.current?.currentTime ?? 0,
			});
		playerRef.current?.addEventListener('play', play);
		playerRef.current?.addEventListener('pause', pause);
		playerRef.current?.addEventListener('timeupdate', setPositionState);
		playerRef.current?.addEventListener('ratechange', setPositionState);
		setPositionState();

		return () => {
			navigator.mediaSession.metadata = null;
			navigator.mediaSession.setActionHandler('play', null);
			navigator.mediaSession.setActionHandler('pause', null);
			navigator.mediaSession.setActionHandler('nexttrack', null);
			navigator.mediaSession.setActionHandler('previoustrack', null);
			playerRef.current?.removeEventListener('play', play);
			playerRef.current?.removeEventListener('pause', pause);
			playerRef.current?.removeEventListener('timeupdate', setPositionState);
			playerRef.current?.removeEventListener('ratechange', setPositionState);
		};
	}, [title, smArtwork, lgArtwork, onNextTrack, playerRef.current]);
};
