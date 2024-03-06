import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import Hls from 'hls.js';

// TODO: リファクタ & テスト & (各deps系が正しいか確認)
export const usePlayer = (src: string, { playPauseSync }: { playPauseSync?: () => boolean } = {}) => {
	const [playing, setPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(-1);
	const [currentRate, setCurrentRate] = useState(1);
	const [loading, setLoading] = useState(false);
	const [ended, setEnded] = useState(false);
	const audio = useRef<HTMLAudioElement | null>(new Audio());

	const play = useCallback(() => {
		audio.current?.play().then(() => {
			if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
		});
	}, []);
	const pause = useCallback(() => {
		audio.current?.pause();
		if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
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
	const toggle = useCallback(() => {
		if (getPlaying()) pause();
		else play();
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

	// 状態Aから状態Bに遷移する時にプレイヤーが再生中であれば一時停止し、さにまたAに戻る時に再生する
	useEffect(() => {
		if (!!playPauseSync?.() && getPlaying()) {
			pause();
			return () => play();
		}
	}, [playPauseSync?.(), getPlaying, pause, play]);

	useEffect(() => {
		audio.current = new Audio();
		if (Hls.isSupported()) {
			const hls = new Hls();
			hls.loadSource(src);
			hls.attachMedia(audio.current);
		} else if (audio.current.canPlayType('application/vnd.apple.mpegurl')) {
			audio.current.src = src;
		}

		const play = () => {
			setPlaying(true);
			setEnded(false);
		};
		const pause = () => setPlaying(false);
		const timeupdate = () => setCurrentTime(audio.current?.currentTime ?? 0);
		const ratechange = () => setCurrentRate(audio.current?.playbackRate ?? 1);
		const ended = () => setEnded(true);
		const loadstart = () => setLoading(true);
		const loadeddata = () => setLoading(false);
		audio.current.addEventListener('play', play);
		audio.current.addEventListener('pause', pause);
		audio.current.addEventListener('timeupdate', timeupdate);
		audio.current.addEventListener('ratechange', ratechange);
		audio.current.addEventListener('ended', ended);
		audio.current.addEventListener('loadstart', loadstart);
		audio.current.addEventListener('loadeddata', loadeddata);

		if (config.current.wasPlaying) audio.current.play();
		audio.current.playbackRate = config.current?.playbackRate ?? 1;

		return () => {
			if (!audio.current) return;
			audio.current.pause();
			audio.current.currentTime = 0;
			audio.current.remove();
			audio.current = null;
		};
	}, [src]);

	return [
		audio,
		{
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
		},
	] as const;
};
