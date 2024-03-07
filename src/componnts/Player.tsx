import { FC } from 'react';
import { clsx } from 'clsx';
import { LoadingSpinnerIcon, NextTrack, PauseIcon, PlayIcon, PrevIcon, RewindIcon, SkipIcon } from './Icons';

export type PlayerProps = {
	playing: boolean;
	ended: boolean;
	playbackRate: number;
	loading: boolean;
	onClickPlay: VoidFunction;
	onClickPause: VoidFunction;
	onClickNextTrack: VoidFunction;
	onClickBackToStart: VoidFunction;
	onClickBack: VoidFunction;
	onClickForward: VoidFunction;
	onClickSwitchPlaybackRate: VoidFunction;
};

// TODO: 操作できなくていいのでプレイヤーの上部に再生位置の表示を追加
export const Player: FC<PlayerProps> = ({
	playing,
	playbackRate,
	loading,
	ended,
	onClickPlay,
	onClickPause,
	onClickNextTrack,
	onClickBackToStart,
	onClickBack,
	onClickForward,
	onClickSwitchPlaybackRate,
}) => {
	return (
		<div className="w-full max-w-4xl select-none">
			<div className="flex items-center rounded-md bg-neutral-900 p-2 text-slate-400">
				<div className="flex flex-auto items-center justify-evenly">
					<button
						type="button"
						className="flex size-12 items-center justify-center rounded-full active:text-slate-100"
						onClick={onClickBackToStart}
						aria-label="Back to start"
						disabled={loading}
					>
						<PrevIcon />
					</button>
					<button
						type="button"
						className="flex size-12 items-center justify-center rounded-full active:text-slate-100"
						onClick={onClickBack}
						aria-label="Rewind to previous sentence"
						disabled={loading}
					>
						<RewindIcon />
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
						<SkipIcon />
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
