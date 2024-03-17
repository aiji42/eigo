import { CalibratedEntry, Entry } from '../schema';
import { MediaPlayer, useMediaPlayer } from './useMediaPlayer';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { getNextPlaybackTime, getPrevPlaybackTime, isTTSed } from '../libs/content';
import { PlayerProps } from '../componnts/Player';

export const usePlayer = (
	src: string,
	entry: Entry | CalibratedEntry | null | undefined,
	{
		navigateToNext,
		navigateToPrev,
		stopAndRestart,
	}: {
		navigateToNext: VoidFunction;
		navigateToPrev: VoidFunction;
		stopAndRestart?: boolean;
	},
): PlayerProps & MediaPlayer => {
	const player = useMediaPlayer(src);
	const loading = useMemo(() => player.loading || !entry || !isTTSed(entry.content), [player.loading, entry]);

	const beforeNavigatePlayerStatus = useRef({
		playing: player.playing,
		playbackRate: player.playbackRate,
		volume: player.volume,
	});

	useEffect(() => {
		if (beforeNavigatePlayerStatus.current.playing && !loading) player.play();
		player.setPlaybackRate(beforeNavigatePlayerStatus.current.playbackRate);
		player.setVolume(beforeNavigatePlayerStatus.current.volume);
	}, [src, loading]);

	const nextTrack = useCallback(() => {
		beforeNavigatePlayerStatus.current.playing = player.playing || player.ended;
		beforeNavigatePlayerStatus.current.playbackRate = player.playbackRate;
		beforeNavigatePlayerStatus.current.volume = player.volume;
		player.stop();
		navigateToNext();
	}, [navigateToNext, player.playing || player.ended, player.playbackRate, player.stop]);

	const prevTrack = useCallback(() => {
		beforeNavigatePlayerStatus.current.playing = player.playing || player.ended;
		beforeNavigatePlayerStatus.current.playbackRate = player.playbackRate;
		beforeNavigatePlayerStatus.current.volume = player.volume;
		player.stop();
		navigateToPrev();
	}, [navigateToPrev, player.playing || player.ended, player.playbackRate, player.stop]);

	useEffect(() => {
		if (!('mediaSession' in navigator)) return;

		navigator.mediaSession.metadata = new MediaMetadata({
			title: entry?.title ?? 'Now loading...',
			artist: 'eigo',
			artwork: entry?.thumbnailUrl
				? [
						{ src: entry.thumbnailUrl, sizes: '96x96' },
						{ src: entry.thumbnailUrl, sizes: '128x128' },
					]
				: [],
		});

		// audioが終端に達すると、イヤホンを2回タップしてもnexttrackは発火せず、代わりにplayが発火するので、endedの場合はnextTrackを呼ぶ
		navigator.mediaSession.setActionHandler('play', player.ended ? nextTrack : player.play);
		navigator.mediaSession.setActionHandler('pause', player.pause);
		navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
		navigator.mediaSession.setActionHandler('previoustrack', prevTrack);

		return () => {
			navigator.mediaSession.setActionHandler('play', null);
			navigator.mediaSession.setActionHandler('pause', null);
			navigator.mediaSession.setActionHandler('nexttrack', null);
			navigator.mediaSession.setActionHandler('previoustrack', null);
		};
	}, [entry, nextTrack, prevTrack, player.ended, player.play, player.pause]);

	// 状態Aから状態Bに遷移する時にプレイヤーが再生中であれば一時停止し、さらにまたAに戻る時に再生する
	useEffect(() => {
		if (stopAndRestart && player.getPlaying()) {
			player.pause();
			return () => {
				player.play().catch();
			};
		}
	}, [stopAndRestart, player.getPlaying, player.pause, player.play]);

	const backToPrev = useCallback(() => {
		if (!entry) return;
		const time = getPrevPlaybackTime(entry.content, player.getCurrentTime());
		if (time < 0) return prevTrack();
		else player.seek(time + 0.01);
	}, [entry, player.seek, player.getCurrentTime, prevTrack]);

	const skipToNext = useCallback(() => {
		if (!entry) return;
		const time = getNextPlaybackTime(entry.content, player.getCurrentTime());
		if (time < 0) nextTrack();
		else player.seek(time + 0.01);
	}, [entry, player.seek, player.getCurrentTime, nextTrack]);

	const switchPlaybackRate = useCallback(() => {
		const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
		const current = rates.indexOf(player.playbackRate);
		const next = current < 0 ? 2 : (current + 1) % rates.length;
		player.setPlaybackRate(rates[next]);
	}, [player.playbackRate, player.setPlaybackRate]);

	const backToStart = useCallback(() => player.seek(0), [player.seek]);

	return {
		...player,
		loading,
		progresses: entry?.content ?? [],
		onClickProgress: player.seek,
		onClickPlay: player.play,
		onClickPause: player.pause,
		onClickNextTrack: nextTrack,
		onClickBack: backToPrev,
		onClickForward: skipToNext,
		onClickSwitchPlaybackRate: switchPlaybackRate,
		onClickBackToStart: backToStart,
	};
};
