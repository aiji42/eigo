import { Entry } from '../schema';
import { MediaPlayer, useMediaPlayer } from './useMediaPlayer';
import { useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { getNextPlaybackTime, getPrevPlaybackTime, isTTSed } from '../libs/content';
import { PlayerProps } from '../componnts/Player';

export const usePlayer = (
	entryId: number | string,
	entry: Entry | null | undefined,
	{
		nextId,
		prevId,
		stopAndRestart,
	}: {
		nextId: number | string | null | undefined;
		prevId: number | string | null | undefined;
		stopAndRestart?: boolean;
	},
): PlayerProps & MediaPlayer => {
	const player = useMediaPlayer(`/playlist/${entryId}/voice.m3u8`);
	const loading = useMemo(() => player.loading || !entry || !isTTSed(entry.content), [player.loading, entry]);

	const navigate = useNavigate();

	const beforeNavigatePlayerStatus = useRef({
		playing: false,
		playbackRate: 1,
		// TODO: volume
	});

	useEffect(() => {
		if (beforeNavigatePlayerStatus.current.playing && !loading) player.play();
		player.setPlaybackRate(beforeNavigatePlayerStatus.current.playbackRate);
	}, [entryId, loading]);

	const nextTrack = useCallback(() => {
		beforeNavigatePlayerStatus.current.playing = player.playing || player.ended;
		beforeNavigatePlayerStatus.current.playbackRate = player.playbackRate;
		if (nextId) navigate(`/${nextId}`, { replace: true });
		else navigate(`/`);
	}, [navigate, nextId, player.playing || player.ended, player.playbackRate]);

	const prevTrack = useCallback(() => {
		beforeNavigatePlayerStatus.current.playing = player.playing || player.ended;
		beforeNavigatePlayerStatus.current.playbackRate = player.playbackRate;
		if (prevId) navigate(`/${prevId}`, { replace: true });
		else navigate(`/`);
	}, [navigate, prevId, player.playing || player.ended, player.playbackRate]);

	useEffect(() => {
		if (!('mediaSession' in navigator)) return;

		navigator.mediaSession.metadata = new MediaMetadata({
			title: entry?.title ?? 'Now loading...',
			artist: 'eigo',
			artwork: entry?.thumbnailUrl
				? [
						{ src: entry.thumbnailUrl, sizes: '96x96', type: 'image/jpeg' },
						{ src: entry.thumbnailUrl, sizes: '128x128', type: 'image/jpeg' },
					]
				: [],
		});

		navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
		navigator.mediaSession.setActionHandler('previoustrack', prevTrack);

		return () => {
			navigator.mediaSession.setActionHandler('nexttrack', null);
			navigator.mediaSession.setActionHandler('previoustrack', null);
		};
	}, [entry, nextTrack, prevTrack]);

	// 状態Aから状態Bに遷移する時にプレイヤーが再生中であれば一時停止し、さらにまたAに戻る時に再生する
	useEffect(() => {
		if (stopAndRestart && player.getPlaying()) {
			player.pause();
			return () => {
				player.play().catch();
			};
		}
	}, [stopAndRestart, player.getPlaying, player.pause, player.play]);

	const backToStart = useCallback(() => player.seek(0), [player.seek]);

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

	return {
		...player,
		loading,
		onClickPlay: player.play,
		onClickPause: player.pause,
		onClickNextTrack: nextTrack,
		onClickBackToStart: backToStart,
		onClickBack: backToPrev,
		onClickForward: skipToNext,
		onClickSwitchPlaybackRate: switchPlaybackRate,
	};
};
