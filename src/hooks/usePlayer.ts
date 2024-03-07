import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import Hls from 'hls.js';

// TODO: リファクタ & テスト & (各deps系が正しいか確認)
export const usePlayer = (src: string, { playPauseSync }: { playPauseSync?: () => boolean } = {}) => {
	const [playing, setPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [currentRate, setCurrentRate] = useState(1);
	const [loading, setLoading] = useState(false);
	const [ended, setEnded] = useState(false);
	const audio = useRef<HTMLAudioElement | null>(null);

	const play = useCallback(async () => {
		return audio.current?.play();
	}, []);
	const pause = useCallback(() => audio.current?.pause(), []);
	const getPlaying = useCallback(
		(showReadyState = true) =>
			!!audio.current &&
			audio.current.currentTime > 0 &&
			!audio.current.paused &&
			!audio.current.ended &&
			(showReadyState ? audio.current.readyState > 2 : true),
		[],
	);
	const getCurrentTime = useCallback(() => audio.current?.currentTime ?? 0, []);
	const toggle = useCallback(async () => {
		if (getPlaying()) pause();
		else await play();
	}, [pause, play, getPlaying]);
	const seek = useCallback((time: number) => {
		if (audio.current) audio.current.currentTime = time;
	}, []);
	const setVolume = useCallback((volume: number) => {
		if (audio.current) audio.current.volume = volume;
	}, []);
	const setPlaybackRate = useCallback((rate: number) => {
		if (audio.current) audio.current.playbackRate = rate;
	}, []);

	const config = useRef({
		playbackRate: audio.current?.playbackRate,
		volume: audio.current?.volume,
		wasPlaying: getPlaying(),
	});
	config.current.wasPlaying = playing || ended;
	config.current.playbackRate = audio.current?.playbackRate;

	const addEventListener = useCallback((audio: HTMLAudioElement) => {
		const play = () => {
			setPlaying(true);
			setEnded(false);
		};
		const pause = () => setPlaying(false);
		const timeupdate = () => {
			setCurrentTime(audio.currentTime ?? 0);
			setEnded(false);
		};
		const ratechange = () => setCurrentRate(audio.playbackRate ?? 1);
		const ended = () => setEnded(true);
		const loadstart = () => setLoading(true);
		const loadeddata = () => setLoading(false);
		audio.addEventListener('play', play);
		audio.addEventListener('pause', pause);
		audio.addEventListener('timeupdate', timeupdate);
		audio.addEventListener('ratechange', ratechange);
		audio.addEventListener('ended', ended);
		audio.addEventListener('loadstart', loadstart);
		audio.addEventListener('loadeddata', loadeddata);

		return () => {
			audio.removeEventListener('play', play);
			audio.removeEventListener('pause', pause);
			audio.removeEventListener('timeupdate', timeupdate);
			audio.removeEventListener('ratechange', ratechange);
			audio.removeEventListener('ended', ended);
			audio.removeEventListener('loadstart', loadstart);
			audio.removeEventListener('loadeddata', loadeddata);
		};
	}, []);

	const syncToMediaSession = useCallback((audio: HTMLAudioElement) => {
		const setPositionState = () =>
			navigator.mediaSession.setPositionState({
				// durationはNaNになりえる
				duration: audio.duration || 0,
				playbackRate: audio.playbackRate,
				position: audio.currentTime,
			});
		const play = () => (navigator.mediaSession.playbackState = 'playing');
		const pause = () => (navigator.mediaSession.playbackState = 'paused');
		audio.addEventListener('play', play);
		audio.addEventListener('pause', pause);
		audio.addEventListener('timeupdate', setPositionState);
		audio.addEventListener('ratechange', setPositionState);
		audio.addEventListener('loadeddata', setPositionState);

		// MEMO: ステータスがpausedなときは、イヤホンを2回タップしてもnexttrackは発火せず、代わりにplayが発火する
		navigator.mediaSession.setActionHandler('play', async () => {
			await audio.play();
			navigator.mediaSession.playbackState = 'playing';
		});
		navigator.mediaSession.setActionHandler('pause', () => {
			audio.pause();
			navigator.mediaSession.playbackState = 'paused';
		});

		return () => {
			audio.removeEventListener('play', play);
			audio.removeEventListener('pause', pause);
			audio.removeEventListener('timeupdate', setPositionState);
			audio.removeEventListener('ratechange', setPositionState);
			audio.removeEventListener('loadeddata', setPositionState);
			navigator.mediaSession.setActionHandler('play', null);
			navigator.mediaSession.setActionHandler('pause', null);
		};
	}, []);

	// 状態Aから状態Bに遷移する時にプレイヤーが再生中であれば一時停止し、さらにまたAに戻る時に再生する
	useEffect(() => {
		if (!!playPauseSync?.() && getPlaying()) {
			pause();
			return () => {
				play().catch();
			};
		}
	}, [playPauseSync?.(), getPlaying, pause, play]);

	useEffect(() => {
		audio.current ||= new Audio();
		const cleanup = addEventListener(audio.current);
		const cleanupMediaSession = syncToMediaSession(audio.current);

		if (Hls.isSupported()) {
			const hls = new Hls();
			hls.loadSource(src);
			hls.attachMedia(audio.current);
		} else if (audio.current.canPlayType('application/vnd.apple.mpegurl')) {
			audio.current.src = src;
		}

		if (config.current.wasPlaying) audio.current.play();
		audio.current.playbackRate = config.current?.playbackRate ?? 1;

		return () => {
			cleanup();
			cleanupMediaSession();
			if (audio.current) audio.current.pause();
			setPlaying(false);
			if (audio.current) audio.current.currentTime = 0;
			setEnded(false);
			setCurrentTime(0);
		};
	}, [src, addEventListener, syncToMediaSession]);

	return {
		playing,
		getPlaying,
		// currentTimeを監視するとコストが高いので、同期的に処理する必要がないならgetCurrentTimeを使うよ良い
		currentTime,
		getCurrentTime,
		play,
		pause,
		toggle,
		setVolume,
		seek,
		setPlaybackRate,
		playbackRate: currentRate,
		loading,
		ended,
	} as const;
};
