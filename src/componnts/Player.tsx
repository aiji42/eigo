import { FC } from 'react';
import { clsx } from 'clsx';
import { LoadingSpinnerIcon, NextTrack, PauseIcon, PlayIcon, SkipPrev, SkipNext, BackToStart } from './Icons';

export type PlayerProps = {
	playing: boolean;
	ended: boolean;
	playbackRate: number;
	currentTime: number;
	progresses: { offset: number | null; duration: number | null }[];
	loading: boolean;
	onClickProgress: (offset: number) => void;
	onClickBackToStart: VoidFunction;
	onClickPlay: VoidFunction;
	onClickPause: VoidFunction;
	onClickNextTrack: VoidFunction;
	onClickBack: VoidFunction;
	onClickForward: VoidFunction;
	onClickSwitchPlaybackRate: VoidFunction;
};

export const Player: FC<PlayerProps> = ({
	currentTime,
	progresses,
	playing,
	playbackRate,
	loading,
	ended,
	onClickPlay,
	onClickPause,
	onClickNextTrack,
	onClickBack,
	onClickForward,
	onClickSwitchPlaybackRate,
	onClickBackToStart,
	onClickProgress,
}) => {
	return (
		<div className="relative flex w-full max-w-4xl select-none flex-col gap-2 bg-neutral-900 p-2 text-slate-400">
			<div className="flex gap-0.5">
				{progresses.map((p, i) => {
					const offset = p.offset ?? 0;
					const duration = p.duration ?? 0;
					return (
						<button
							key={i}
							type="button"
							className={clsx('h-1.5 flex-1 overflow-hidden rounded', currentTime < offset + duration ? 'bg-neutral-700' : 'bg-slate-400')}
							onClick={() => onClickProgress(offset)}
						>
							{offset < currentTime && currentTime < offset + duration && (
								<div className="h-full rounded-full bg-slate-400" style={{ width: `${((currentTime - offset) / duration) * 100}%` }} />
							)}
						</button>
					);
				})}
			</div>
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
