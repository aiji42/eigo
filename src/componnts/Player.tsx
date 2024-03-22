import { FC } from 'react';
import { clsx } from 'clsx';
import { LoadingSpinnerIcon, NextTrack, PauseIcon, PlayIcon, SkipPrev, SkipNext, BackToStart } from './Icons';
import { EntryData } from '../hooks/usePlayer';
import { Link } from 'react-router-dom';

export type PlayerProps = {
	mode: 'media' | 'control';
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
	entry: EntryData;
};

export const Player: FC<PlayerProps> = (props) => {
	const { duration, currentTime, mode } = props;
	return (
		<div className="relative flex w-full max-w-4xl select-none flex-col bg-neutral-100 text-neutral-500">
			<div
				className="absolute bottom-[calc(100%-2px)] h-0.5 rounded-full bg-green-400"
				style={{ width: duration ? `${(currentTime / duration) * 100}%` : 0 }}
			/>
			{mode === 'media' ? <MediaPlayer {...props} /> : <ControlPlayer {...props} />}
		</div>
	);
};

const MediaPlayer: FC<PlayerProps> = ({ entry: _entry, playing, ended, onClickPlay, onClickNextTrack, onClickPause, loading }) => {
	const entry = ended ? _entry.next : _entry;
	const entryId = !entry ? null : 'entryId' in entry ? entry.entryId : entry.id;

	return (
		<div className="flex items-center">
			<Link to={entryId ? `/${entryId}` : '/'} replace={ended} className="max-w-3/4 flex items-center gap-2 overflow-hidden">
				<img src={entry?.thumbnailUrl ?? ''} alt={entry?.title} className="max-h-[72px] w-32 object-cover" />
				<p className="line-clamp-2 h-full text-ellipsis">{!entryId ? 'Back to list page' : `${ended ? 'Next: ' : ''}${entry?.title}`}</p>
			</Link>
			<button
				type="button"
				className={clsx(
					'relative mx-4 flex size-14 items-center',
					playing ? 'text-slate-600 active:text-slate-500' : 'text-green-600 active:text-green-500',
				)}
				onClick={ended ? onClickNextTrack : playing ? onClickPause : onClickPlay}
				aria-label={ended ? 'Next track' : playing ? 'Pause' : 'Play'}
				disabled={loading}
			>
				{loading ? <LoadingSpinnerIcon /> : playing ? <PauseIcon /> : <PlayIcon />}
			</button>
		</div>
	);
};

const ControlPlayer: FC<PlayerProps> = ({
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
}) => {
	return (
		<div className="flex items-center py-2">
			<div className="flex flex-auto items-center justify-evenly">
				<button
					type="button"
					className="flex size-12 items-center justify-center rounded-full active:text-slate-400"
					onClick={onClickBackToStart}
					aria-label="Back to start"
					disabled={loading}
				>
					<BackToStart />
				</button>
				<button
					type="button"
					className="flex size-12 items-center justify-center rounded-full active:text-slate-400"
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
					'relative mx-auto flex size-14 flex-none items-center justify-center rounded-full bg-neutral-200/50 shadow-md  active:bg-neutral-100',
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
					className="flex size-12 items-center justify-center rounded-full active:text-slate-400"
					onClick={onClickForward}
					aria-label="Skoip to next sentence"
					disabled={loading}
				>
					<SkipNext />
				</button>
				<button
					type="button"
					className="flex size-12 items-center justify-center rounded-full font-bold active:text-slate-400"
					onClick={onClickSwitchPlaybackRate}
					aria-label="Change playback rate"
				>
					x{playbackRate}
				</button>
			</div>
		</div>
	);
};
