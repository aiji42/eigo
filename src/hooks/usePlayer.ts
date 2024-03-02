import { useEffect, useReducer, useRef, useState } from 'react';
import Hls from 'hls.js';
import { InferSelectModel } from 'drizzle-orm';
import { entries } from '../schema';

export const usePlayer = (entry: InferSelectModel<typeof entries> | null | undefined, autoPlay = false) => {
	const [isMounted, mount] = useReducer(() => true, false);
	const [playing, setPlaying] = useState(false);
	const [current, setCurrent] = useState(0);
	const [currentRate, setCurrentRate] = useState(1);
	const ref = useRef<HTMLAudioElement>(null);

	const src = entry ? `/playlist/${entry.id}/voice.m3u8` : '';

	useEffect(() => {
		if (!entry || !isMounted || !ref.current) return;
		if ('mediaSession' in navigator) {
			console.log(entry.thumbnailUrl);
			navigator.mediaSession.metadata = new MediaMetadata({
				title: entry.title,
				artist: 'eigo',
				artwork: entry.thumbnailUrl
					? [
							{ src: entry.thumbnailUrl, sizes: '96x96', type: 'image/jpeg' },
							{ src: entry.thumbnailUrl, sizes: '128x128', type: 'image/jpeg' },
						]
					: [],
			});

			navigator.mediaSession.setActionHandler('play', () => {
				ref.current?.play();
			});
			navigator.mediaSession.setActionHandler('pause', () => {
				ref.current?.pause();
			});
			navigator.mediaSession.setActionHandler('nexttrack', () => {
				// ページを送る
			});
			navigator.mediaSession.setActionHandler('previoustrack', () => {
				// ページを戻す
			});
		}
	}, [entry, isMounted]);

	useEffect(() => {
		if (!isMounted || !ref.current) return;
		if (Hls.isSupported()) {
			const hls = new Hls();
			hls.loadSource(src);
			hls.attachMedia(ref.current);
		} else if (ref.current.canPlayType('application/vnd.apple.mpegurl')) {
			ref.current.src = src;
		}

		const play = () => {
			setPlaying(true);
			navigator.mediaSession.playbackState = 'playing';
		};
		const pause = () => {
			setPlaying(false);
			navigator.mediaSession.playbackState = 'paused';
		};
		const timeupdate = () => setCurrent(ref.current?.currentTime ?? 0);
		const ratechange = () => setCurrentRate(ref.current?.playbackRate ?? 1);
		const ended = () => (navigator.mediaSession.playbackState = 'none');
		ref.current.addEventListener('play', play);
		ref.current.addEventListener('pause', pause);
		ref.current.addEventListener('timeupdate', timeupdate);
		ref.current.addEventListener('ratechange', ratechange);
		ref.current.addEventListener('ended', ended);

		if (autoPlay) ref.current.play();

		return () => {
			ref.current?.removeEventListener('play', play);
			ref.current?.removeEventListener('pause', pause);
			ref.current?.removeEventListener('timeupdate', timeupdate);
			ref.current?.removeEventListener('ratechange', ratechange);
			ref.current?.removeEventListener('ended', ended);
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
	const switchRate = () => {
		const selectable = [0.5, 0.75, 1, 1.25, 1.5, 2];
		const index = selectable.indexOf(currentRate);
		const nextIndex = index === selectable.length - 1 ? 0 : index + 1;
		setPlaybackRate(selectable[nextIndex]);
	};

	return [
		ref,
		{ playing, current, play, pause, toggle, setVolume, rewind, back10, forward10, setPlaybackRate, switchRate, currentRate, mount },
	] as const;
};
