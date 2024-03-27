import { useMediaPlayer } from './useMediaPlayer';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { getNextPlaybackTime, getPrevPlaybackTime, getTotalDuration, isTTSed } from '../libs/content';
import { CEFRLevel } from '../schema';
import { useNavigate } from 'react-router-dom';
import { EntryData } from './useEntry';

const getSrc = (entry: EntryData | null, level: CEFRLevel | null) => {
	if (!entry) return null;
	const entryId = 'entryId' in entry ? entry.entryId : entry.id;
	return level ? `/${entryId}/${level}/playlist.m3u8` : `/${entryId}/playlist.m3u8`;
};

export const usePlayer = (entry: EntryData | null, level: null | CEFRLevel) => {
	const src = getSrc(entry, level);
	const player = useMediaPlayer(src);
	const loading = useMemo(() => player.loading || !entry || !isTTSed(entry.content), [player.loading, entry]);
	const navigate = useNavigate();

	const beforeNavigatePlayerStatus = useRef({
		playing: player.playing,
		playbackRate: player.playbackRate,
		volume: player.volume,
	});

	const stopAndStorePlayerStatus = useCallback(() => {
		beforeNavigatePlayerStatus.current.playing = player.playing || player.ended;
		beforeNavigatePlayerStatus.current.playbackRate = player.playbackRate;
		beforeNavigatePlayerStatus.current.volume = player.volume;
		player.stop();
	}, [player.playing || player.ended, player.playbackRate, player.volume, player.stop]);

	// auto play
	useEffect(() => {
		if (beforeNavigatePlayerStatus.current.playing && !loading && src) player.play();
		player.setPlaybackRate(beforeNavigatePlayerStatus.current.playbackRate);
		player.setVolume(beforeNavigatePlayerStatus.current.volume);
	}, [src, loading]);

	const nextTrack = useCallback(() => {
		stopAndStorePlayerStatus();
		navigate(entry?.next ? `/${entry.next.id}` : '/', { replace: !!entry?.next });
	}, [navigate, entry?.next, stopAndStorePlayerStatus]);

	const prevTrack = useCallback(() => {
		stopAndStorePlayerStatus();
		navigate(entry?.prev ? `/${entry.prev.id}` : '/', { replace: !!entry?.prev });
	}, [navigate, entry?.prev, stopAndStorePlayerStatus]);

	useEffect(() => {
		if (!('mediaSession' in navigator) || !entry) return;

		navigator.mediaSession.metadata = new MediaMetadata({
			title: entry.title,
			artist: 'eigo',
			artwork: entry.thumbnailUrl
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
		duration: getTotalDuration(entry?.content ?? []),
		onClickPlay: player.play,
		onClickPause: player.pause,
		onClickNextTrack: nextTrack,
		onClickBack: backToPrev,
		onClickForward: skipToNext,
		onClickSwitchPlaybackRate: switchPlaybackRate,
		onClickBackToStart: backToStart,
	};
};
