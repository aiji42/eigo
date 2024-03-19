import { FC } from 'react';
import { clsx } from 'clsx';
import { LoadingSpinnerIcon, NextTrack, PauseIcon, PlayIcon, SkipPrev, SkipNext, BackToStart } from './Icons';

export type PlayerProps = {
	playing: boolean;
	ended: boolean;
	playbackRate: number;
	currentTime: number;
	loading: boolean;
	duration: number;
	onClickBackToStart: VoidFunction;
	onClickPlay: VoidFunction;
	onClickPause: VoidFunction;
	onClickNextTrack: VoidFunction;
	onClickBack: VoidFunction;
	onClickForward: VoidFunction;
	onClickSwitchPlaybackRate: VoidFunction;
};

export const Player: FC<PlayerProps> = ({
	playing,
	playbackRate,
	loading,
	ended,
	duration,
	currentTime,
	onClickPlay,
	onClickPause,
	onClickNextTrack,
	onClickBack,
	onClickForward,
	onClickSwitchPlaybackRate,
	onClickBackToStart,
}) => {
	return (
		<div className="relative flex w-full max-w-4xl select-none flex-col bg-neutral-900 py-2 text-slate-400">
			<div
				className="absolute bottom-[calc(100%-2px)] h-0.5 rounded-full bg-green-400"
				style={{ width: duration ? `${(currentTime / duration) * 100}%` : 0 }}
			/>
			<div className="flex items-center">
				<div className="flex flex-auto items-center justify-evenly">
					<button
						type="button"
						className="flex size-12 items-center justify-center rounded-full active:text-slate-100"
						onClick={onClickBackToStart}
						aria-label="Back to start"
						disabled={loading}
					>
						<BackToStart />
					</button>
					<button
						type="button"
						className="flex size-12 items-center justify-center rounded-full active:text-slate-100"
						onClick={onClickBack}
						aria-label="Rewind to previous sentence"
						disabled={loading}
					>
						<SkipPrev />
					</button>
				</div>
				<button
					type="button"
					className={clsx(
						'relative mx-auto flex size-14 flex-none items-center justify-center rounded-full bg-slate-100 shadow-md ring-1 ring-slate-900/5 active:bg-slate-50',
						playing ? 'text-slate-600' : 'text-green-600',
					)}
					onClick={ended ? onClickNextTrack : playing ? onClickPause : onClickPlay}
					aria-label={ended ? 'Next track' : playing ? 'Pause' : 'Play'}
					disabled={loading}
				>
					{loading ? <LoadingSpinnerIcon /> : ended ? <NextTrack /> : playing ? <PauseIcon /> : <PlayIcon />}
				</button>
				<div className="flex flex-auto items-center justify-evenly">
					<button
						type="button"
						className="flex size-12 items-center justify-center rounded-full active:text-slate-100"
						onClick={onClickForward}
						aria-label="Skoip to next sentence"
						disabled={loading}
					>
						<SkipNext />
					</button>
					<button
						type="button"
						className="flex size-12 items-center justify-center rounded-full font-bold active:text-slate-100"
						onClick={onClickSwitchPlaybackRate}
						aria-label="Change playback rate"
					>
						x{playbackRate}
					</button>
				</div>
			</div>
		</div>
	);
};
