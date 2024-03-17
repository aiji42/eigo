import { FC, useEffect, useReducer, useState } from 'react';
import { clsx } from 'clsx';
import { LoadingSpinnerIcon, NextTrack, PauseIcon, PlayIcon, SkipPrev, SkipNext } from './Icons';
import { CEFRLevel } from '../schema';
import { Link, useSearchParams } from 'react-router-dom';
import { isCEFRLevel } from '../libs/utils';

export type PlayerProps = {
	playing: boolean;
	ended: boolean;
	playbackRate: number;
	currentTime: number;
	progresses: { offset: number | null; duration: number | null }[];
	loading: boolean;
	onClickProgress: (offset: number) => void;
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
	onClickProgress,
}) => {
	const [isOpening, setIsOpen] = useState(false);
	const [searchParams] = useSearchParams();
	const level = searchParams.get('level');
	useEffect(() => {
		setIsOpen(false);
	}, [level]);

	return (
		<div className="relative flex w-full max-w-4xl select-none flex-col gap-4 bg-neutral-900 p-2 text-slate-400">
			<div className="flex gap-0.5">
				{progresses.map((p, i) => {
					const offset = p.offset ?? 0;
					const duration = p.duration ?? 0;
					return (
						<button
							key={i}
							className={clsx('h-2 flex-1 overflow-hidden rounded', currentTime < offset + duration ? 'bg-neutral-800' : 'bg-neutral-700')}
							onClick={() => onClickProgress(offset)}
						>
							{offset < currentTime && currentTime < offset + duration && (
								<div className="h-full rounded-full bg-neutral-700" style={{ width: `${((currentTime - offset) / duration) * 100}%` }} />
							)}
						</button>
					);
				})}
			</div>
			<div className="flex items-center">
				<div className="flex flex-auto items-center justify-evenly">
					<div>
						<button
							type="button"
							className="flex size-12 items-center justify-center rounded-full font-bold active:text-slate-100"
							onClick={() => setIsOpen((c) => !c)}
							aria-label={!isOpening ? 'Open CEFR levels menu' : 'Close CEFR levels menu'}
						>
							{level ?? 'Og'}
						</button>
						<div
							className={clsx('absolute bottom-1/2 transform duration-200', !isOpening && 'pointer-events-none opacity-0')}
							{...(!isOpening && { inert: '' })}
						>
							<CEFRLevelsMenu current={isCEFRLevel(level) ? level : null} />
						</div>
					</div>
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

const levelColors = {
	A1: 'text-violet-100',
	A2: 'text-violet-200',
	B1: 'text-teal-100',
	B2: 'text-teal-200',
	C1: 'text-pink-100',
	C2: 'text-teal-200',
};

const CEFRLevelsMenu: FC<{ current: null | CEFRLevel }> = ({ current }) => {
	return (
		<div className="flex flex-col gap-4 bg-neutral-900 p-3 text-xl font-bold">
			{current && (
				<Link className="active:bg-neutral-800" to={{ search: '' }} replace>
					Or
				</Link>
			)}
			{(['A1', 'A2', 'B1'] as const)
				.filter((level) => current !== level)
				.map((level) => (
					<Link to={{ search: `level=${level}` }} replace key={level} className={clsx('active:bg-neutral-800', levelColors[level])}>
						{level}
					</Link>
				))}
		</div>
	);
};
