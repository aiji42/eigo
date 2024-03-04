import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import Hls from 'hls.js';

// TODO: リファクタ & テスト & (各deps系が正しいか確認)
export const usePlayer = (src: string | null | undefined, autoPlay = false) => {
	const [isMounted, mount] = useReducer(() => true, false);
	const [playing, setPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(-1);
	const [currentRate, setCurrentRate] = useState(1);
	const [loading, setLoading] = useState(false);
	const ref = useRef<HTMLAudioElement>(null);

	useEffect(() => {
		if (!src || !isMounted || !ref.current) return;
		if (Hls.isSupported()) {
			const hls = new Hls();
			hls.loadSource(src);
			hls.attachMedia(ref.current);
		} else if (ref.current.canPlayType('application/vnd.apple.mpegurl')) {
			ref.current.src = src;
		}

		const play = () => setPlaying(true);
		const pause = () => setPlaying(false);
		const timeupdate = () => setCurrentTime(ref.current?.currentTime ?? 0);
		const ratechange = () => setCurrentRate(ref.current?.playbackRate ?? 1);
		const ended = () => (navigator.mediaSession.playbackState = 'none');
		const loadstart = () => setLoading(true);
		const loadeddata = () => setLoading(false);
		ref.current.addEventListener('play', play);
		ref.current.addEventListener('pause', pause);
		ref.current.addEventListener('timeupdate', timeupdate);
		ref.current.addEventListener('ratechange', ratechange);
		ref.current.addEventListener('ended', ended);
		ref.current.addEventListener('loadstart', loadstart);
		ref.current.addEventListener('loadeddata', loadeddata);

		if (autoPlay) ref.current.play();

		return () => {
			ref.current?.removeEventListener('play', play);
			ref.current?.removeEventListener('pause', pause);
			ref.current?.removeEventListener('timeupdate', timeupdate);
			ref.current?.removeEventListener('ratechange', ratechange);
			ref.current?.removeEventListener('ended', ended);
			ref.current?.removeEventListener('loadstart', loadstart);
			ref.current?.removeEventListener('loadeddata', loadeddata);
		};
	}, [src, autoPlay, isMounted]);

	const play = useCallback(() => ref.current?.play(), []);
	const pause = useCallback(() => ref.current?.pause(), []);
	const toggle = useCallback(() => {
		if (!ref.current) return;
		const isPlaying = ref.current.currentTime > 0 && !ref.current.paused && !ref.current.ended && ref.current.readyState > 2;
		if (isPlaying) pause();
		else play();
	}, [pause, play]);
	const seek = useCallback((time: number) => {
		if (ref.current) ref.current.currentTime = time;
	}, []);
	const setVolume = useCallback((volume: number) => {
		if (ref.current) ref.current.volume = volume;
	}, []);
	const setPlaybackRate = useCallback((rate: number) => {
		if (ref.current) ref.current.playbackRate = rate;
	}, []);

	return [
		ref,
		{
			playing,
			currentTime,
			play,
			pause,
			toggle,
			setVolume,
			seek,
			setPlaybackRate,
			playbackRate: currentRate,
			mount,
			loading,
		},
	] as const;
};
