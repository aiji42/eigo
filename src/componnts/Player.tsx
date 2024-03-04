import { FC, RefObject, useCallback, useEffect } from 'react';
import { clsx } from 'clsx';
import { LoadingSpinnerIcon, PauseIcon, PlayIcon, PrevIcon, RewindIcon, SkipIcon } from './Icons';
import { Content, getNextPlayableSentence, getPrevPlayableSentence } from '../libs/content';

export type PlayerProps = {
	playerRef: RefObject<HTMLAudioElement>;
	currentTime: number;
	playing: boolean;
	toggle: () => void;
	seek: (time: number) => void;
	playbackRate: number;
	setPlaybackRate: (rate: number) => void;
	mount: () => void;
	loading?: boolean;
	content: Content;
};

export const Player: FC<PlayerProps> = ({
	playerRef,
	playing,
	seek,
	toggle,
	setPlaybackRate,
	playbackRate,
	loading,
	mount,
	currentTime,
	content,
}) => {
	useEffect(() => {
		mount();
	}, [mount]);

	const switchPlaybackRate = useCallback(() => {
		const rates = [0.5, 7.5, 1, 1.25, 1.5, 2];
		const current = rates.indexOf(playbackRate);
		const next = current < 0 ? 2 : (current + 1) % rates.length;
		setPlaybackRate(rates[next]);
	}, [playbackRate, setPlaybackRate]);

	const backPrev = useCallback(() => {
		const prev = getPrevPlayableSentence(content, currentTime);
		if (!prev) seek(0);
		else seek((prev.offset ?? 0) + 0.01);
	}, [content, seek, currentTime]);

	const skipNext = useCallback(() => {
		const prev = getNextPlayableSentence(content, currentTime);
		if (!prev) seek(0);
		else seek((prev.offset ?? 0) + 0.01);
	}, [content, seek, currentTime]);

	return (
		<div className="w-full max-w-4xl">
			<audio ref={playerRef} />
			<div className="flex items-center rounded-md bg-neutral-900 p-2 text-slate-400 md:p-4">
				<div className="flex flex-auto items-center justify-evenly">
					<button
						type="button"
						className="flex size-12 items-center justify-center rounded-full active:text-slate-100"
						onClick={() => seek(0)}
						aria-label="Back to start"
						disabled={loading}
					>
						<PrevIcon />
					</button>
					<button
						type="button"
						className="flex size-12 items-center justify-center rounded-full active:text-slate-100"
						onClick={backPrev}
						aria-label="Rewind to previous sentence"
						disabled={loading}
					>
						<RewindIcon />
					</button>
				</div>
				<button
					type="button"
					className={clsx(
						'mx-auto flex size-14 flex-none items-center justify-center rounded-full bg-slate-100 shadow-md ring-1 ring-slate-900/5 active:bg-slate-50 md:size-16',
						playing ? 'text-slate-600' : 'text-green-600',
					)}
					onClick={toggle}
					aria-label={playing ? 'Pause' : 'Play'}
					disabled={loading}
				>
					{loading ? <LoadingSpinnerIcon /> : playing ? <PauseIcon /> : <PlayIcon />}
				</button>
				<div className="flex flex-auto items-center justify-evenly">
					<button
						type="button"
						className="flex size-12 items-center justify-center rounded-full active:text-slate-100"
						onClick={skipNext}
						aria-label="Skoip to next sentence"
						disabled={loading}
					>
						<SkipIcon />
					</button>
					<button
						type="button"
						className="flex size-12 items-center justify-center rounded-full font-bold active:text-slate-100"
						onClick={switchPlaybackRate}
						aria-label="Change playback rate"
						disabled={loading}
					>
						x{playbackRate}
					</button>
				</div>
			</div>
		</div>
	);
};
