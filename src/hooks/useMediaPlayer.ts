import { useCallback, useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { useLocalStorage } from '@rehooks/local-storage';

export const useMediaPlayer = (src: string) => {
	const [playing, setPlaying] = useState(false);
	const [volume, setCurrentVolume] = useState(1);
	const [currentTime, setCurrentTime] = useState(0);
	const [currentRate, setCurrentRate] = useLocalStorage('playbackRate', 1);
	const [loading, setLoading] = useState(false);
	const [ended, setEnded] = useState(false);
	const audio = useRef<HTMLAudioElement | null>(null);

	const play = useCallback(async () => {
		return audio.current?.play().then(() => {
			setPlaying(true);
			navigator.mediaSession.playbackState = 'playing';
		});
	}, []);
	const pause = useCallback(() => {
		if (!audio.current) return;
		audio.current.pause();
		setPlaying(false);
		navigator.mediaSession.playbackState = 'paused';
	}, []);
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
		if (!audio.current) return;
		audio.current.currentTime = time;
		setCurrentTime(time);
	}, []);
	const setVolume = useCallback((volume: number) => {
		if (!audio.current) return;
		audio.current.volume = volume;
		setCurrentVolume(volume);
	}, []);
	const setPlaybackRate = useCallback((rate: number) => {
		if (!audio.current) return;
		audio.current.playbackRate = rate;
		setCurrentRate(rate);
	}, []);
	const stop = useCallback(() => {
		seek(0);
		pause();
	}, [seek, pause]);

	const addEventListener = useCallback((audio: HTMLAudioElement) => {
		const play = () => {
			setPlaying(true);
			setEnded(false);
		};
		const pause = () => setPlaying(false);
		const timeupdate = () => {
			setCurrentTime(audio.currentTime);
			setEnded(false);
		};
		const ratechange = () => setCurrentRate(audio.playbackRate);
		const volumechange = () => setCurrentVolume(audio.volume);
		const ended = () => setEnded(true);
		const loadstart = () => setLoading(true);
		const loadeddata = () => setLoading(false);
		audio.addEventListener('play', play);
		audio.addEventListener('pause', pause);
		audio.addEventListener('timeupdate', timeupdate);
		audio.addEventListener('ratechange', ratechange);
		audio.addEventListener('volumechange', volumechange);
		audio.addEventListener('ended', ended);
		audio.addEventListener('loadstart', loadstart);
		audio.addEventListener('loadeddata', loadeddata);

		return () => {
			audio.removeEventListener('play', play);
			audio.removeEventListener('pause', pause);
			audio.removeEventListener('timeupdate', timeupdate);
			audio.removeEventListener('ratechange', ratechange);
			audio.removeEventListener('volumechange', volumechange);
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

		return () => {
			audio.removeEventListener('play', play);
			audio.removeEventListener('pause', pause);
			audio.removeEventListener('timeupdate', setPositionState);
			audio.removeEventListener('ratechange', setPositionState);
			audio.removeEventListener('loadeddata', setPositionState);
		};
	}, []);

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
		stop,
		toggle,
		setVolume,
		volume,
		seek,
		setPlaybackRate,
		playbackRate: currentRate,
		loading,
		ended,
	} as const;
};

export type MediaPlayer = ReturnType<typeof useMediaPlayer>;
