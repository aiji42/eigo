import { FC, useEffect, useReducer, useRef } from 'react';
import { clsx } from 'clsx';
import { LoadingSpinnerIcon, NextTrack, PauseIcon, PlayIcon, PrevIcon, RewindIcon, SkipIcon } from './Icons';
import { CEFRLevel } from '../schema';
import { useSearchParams } from 'react-router-dom';
import { CalibrateEntryState } from '../hooks/useCalibrateEntryState';

export type Level = {
	current: CEFRLevel | null;
	availables: CalibrateEntryState[];
};

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
	level: Level;
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
	onClickBack,
	onClickForward,
	onClickSwitchPlaybackRate,
	level,
}) => {
	const [isOpening, toggle] = useReducer((s) => !s, false);

	return (
		<div className="relative w-full max-w-4xl select-none">
			<div className="flex items-center rounded-md bg-neutral-900 p-2 text-slate-400">
				<div className="flex flex-auto items-center justify-evenly">
					<div>
						<button
							type="button"
							className="flex size-12 items-center justify-center rounded-full font-bold active:text-slate-100"
							onClick={toggle}
							aria-label={!isOpening ? 'Open CEFR levels menu' : 'Close CEFR levels menu'}
						>
							{level.current ?? 'Og'}
						</button>
						<div
							className={clsx('absolute bottom-full transform duration-200', !isOpening && 'pointer-events-none opacity-0')}
							{...(!isOpening && { inert: '' })}
						>
							<CEFRLevelsMenu level={level} onClose={toggle} />
						</div>
					</div>
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

const levelColors = {
	A1: 'text-violet-100',
	A2: 'text-violet-200',
	B1: 'text-teal-100',
	B2: 'text-teal-200',
	C1: 'text-pink-100',
	C2: 'text-teal-200',
};

const CEFRLevelsMenu: FC<{ level: Level; onClose: VoidFunction }> = ({ level: { current, availables }, onClose }) => {
	const [, setSearchParams] = useSearchParams();

	return (
		<div className="flex w-44 flex-col gap-4 bg-neutral-900 p-3">
			<button
				className="flex w-36 items-center gap-4 active:bg-neutral-800"
				disabled={!current}
				onClick={() => setSearchParams({ level: '' })}
			>
				<div className="w-8 text-xl font-bold">Or</div>
				<div className="text-base">{!current ? 'Current' : 'Available'}</div>
			</button>
			{availables.map(({ level, isCalibrating, isCalibrated, calibrate }) => (
				<button
					key={level}
					className={clsx('flex w-36 items-center justify-start gap-4 active:bg-neutral-800', isCalibrating && 'animate-pulse')}
					disabled={current === level || isCalibrating}
					onClick={() => {
						if (isCalibrated) {
							setSearchParams({ level });
							onClose();
						} else calibrate();
					}}
				>
					<div className={clsx('w-8 text-xl font-bold', levelColors[level])}>{level}</div>
					<div className="text-base">
						{current === level ? 'Current' : isCalibrated ? 'Available' : isCalibrating ? 'Generating...' : 'Generate'}
					</div>
				</button>
			))}
		</div>
	);
};
