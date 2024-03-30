import { FC } from 'react';
import { clsx } from 'clsx';
import { LoadingSpinnerIcon, NextTrack, PauseIcon, PlayIcon, SkipPrev, SkipNext, SubtitlesIcon, Replay } from './Icons';
import { EntryData } from '../hooks/useEntry';
import { Link } from 'react-router-dom';
import { ExplanationPanel } from './ExplanationPanel';
import { getPlaying } from '../libs/content';

export type PlayerProps = {
	mode: 'media' | 'control';
	showExplanation: boolean;
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
	onClickShowExplanation: VoidFunction;
	entry: EntryData;
};

export const Player: FC<PlayerProps> = (props) => {
	const { duration, currentTime, mode, entry } = props;
	const showExplanation = props.showExplanation && mode !== 'media';

	return (
		<div className="flex w-full max-w-4xl select-none flex-col">
			{showExplanation && (
				<div className="rounded-t-xl bg-neutral-50/95 backdrop-blur-lg">
					<ExplanationPanel text={getPlaying(entry.content, currentTime).sentence?.text} />
				</div>
			)}
			<div className="relative bg-neutral-100">
				<div
					className="absolute bottom-[calc(100%-2px)] h-0.5 rounded-full bg-green-400"
					style={{ width: duration ? `${(currentTime / duration) * 100}%` : 0 }}
				/>
				{mode === 'media' ? <MediaPlayer {...props} /> : <ControlPlayer {...props} />}
			</div>
		</div>
	);
};

const MediaPlayer: FC<PlayerProps> = ({
	entry: _entry,
	playing,
	ended,
	onClickPlay,
	onClickNextTrack,
	onClickPause,
	onClickBackToStart,
	loading,
}) => {
	const entry = ended ? _entry.next : _entry;
	const entryId = !entry ? null : 'entryId' in entry ? entry.entryId : entry.id;

	return (
		<div className="flex items-center justify-between">
			<Link to={entryId ? `/${entryId}` : '/'} replace={ended} className="max-w-3/4 flex items-center gap-2 overflow-hidden">
				<img src={entry?.thumbnailUrl ?? ''} alt={entry?.title} className="max-h-[72px] w-32 object-cover" />
				<p className="line-clamp-2 h-full text-ellipsis">{!entryId ? 'Back to list page' : `${ended ? 'Next: ' : ''}${entry?.title}`}</p>
			</Link>
			<div className="mx-4 flex items-center gap-4 md:gap-10">
				{ended && (
					<button
						type="button"
						className="flex size-8 items-center justify-center text-slate-600 active:text-slate-500"
						onClick={onClickBackToStart}
						aria-label="Replay"
						disabled={loading}
					>
						<Replay />
					</button>
				)}
				<button
					type="button"
					className={clsx(
						'relative flex size-14 items-center',
						playing ? 'text-slate-600 active:text-slate-500' : 'text-green-600 active:text-green-500',
					)}
					onClick={ended ? onClickNextTrack : playing ? onClickPause : onClickPlay}
					aria-label={ended ? 'Next track' : playing ? 'Pause' : 'Play'}
					disabled={loading}
				>
					{loading ? <LoadingSpinnerIcon /> : playing ? <PauseIcon /> : <PlayIcon />}
				</button>
			</div>
		</div>
	);
};

const ControlPlayer: FC<PlayerProps> = ({
	playing,
	playbackRate,
	loading,
	ended,
	showExplanation,
	onClickPlay,
	onClickPause,
	onClickNextTrack,
	onClickBack,
	onClickForward,
	onClickSwitchPlaybackRate,
	onClickShowExplanation,
}) => {
	return (
		<div className="flex items-center py-2">
			<div className="flex flex-auto items-center justify-evenly">
				<button
					type="button"
					className="flex size-12 items-center justify-center rounded-full active:text-slate-400"
					onClick={onClickShowExplanation}
					aria-label={showExplanation ? 'Show explanation' : 'Hide explanation'}
				>
					<SubtitlesIcon
						className={clsx(
							'text-3xl',
							showExplanation
								? 'bg-transparent bg-gradient-to-tr from-sky-600 to-cyan-400 bg-clip-text text-transparent'
								: 'text-neutral-500',
						)}
					/>
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
					{playbackRate}x
				</button>
			</div>
		</div>
	);
};
