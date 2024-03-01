import { useEffect, useReducer, useRef, useState } from 'react';
import Hls from 'hls.js';

export const usePlayer = (src: string, autoPlay = false) => {
	const [isMounted, mount] = useReducer(() => true, false);
	const [playing, setPlaying] = useState(false);
	const [current, setCurrent] = useState(0);
	const ref = useRef<HTMLAudioElement>(null);

	useEffect(() => {
		if (!isMounted || !ref.current) return;
		if (Hls.isSupported()) {
			const hls = new Hls();
			hls.loadSource(src);
			hls.attachMedia(ref.current);
		} else if (ref.current.canPlayType('application/vnd.apple.mpegurl')) {
			ref.current.src = src;
		}

		const play = () => setPlaying(true);
		const pause = () => setPlaying(false);
		const timeupdate = () => setCurrent(ref.current?.currentTime ?? 0);
		ref.current.addEventListener('play', play);
		ref.current.addEventListener('pause', pause);
		ref.current.addEventListener('timeupdate', timeupdate);

		if (autoPlay) ref.current.play();

		return () => {
			ref.current?.removeEventListener('play', play);
			ref.current?.removeEventListener('pause', pause);
			ref.current?.removeEventListener('timeupdate', timeupdate);
		};
	}, [src, autoPlay, isMounted]);

	const play = () => ref.current?.play();
	const pause = () => ref.current?.pause();
	const toggle = () => (playing ? pause() : play());
	const seek = (time: number) => {
		if (ref.current) ref.current.currentTime = time;
	};
	const setVolume = (volume: number) => {
		if (ref.current) ref.current.volume = volume;
	};
	const rewind = () => seek(0);
	const back10 = () => seek(current - 10);
	const forward10 = () => seek(current + 10);
	const setPlaybackRate = (rate: number) => {
		if (ref.current) ref.current.playbackRate = rate;
	};

	return [ref, { playing, current, play, pause, toggle, setVolume, rewind, back10, forward10, setPlaybackRate, mount }] as const;
};
