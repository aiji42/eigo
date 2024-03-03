import { FC, useEffect } from 'react';
import { clsx } from 'clsx';
import { LoadingSpinnerIcon, PauseIcon, PlayIcon, PrevIcon, RewindIcon, SkipIcon } from './Icons';

export type PlayerProps = {
	playerRef: React.RefObject<HTMLAudioElement>;
	playing: boolean;
	toggle: () => void;
	rewind: () => void;
	back10: () => void;
	forward10: () => void;
	currentRate: number;
	switchRate: () => void;
	mount: () => void;
	loading?: boolean;
};

export const Player: FC<PlayerProps> = ({
	playerRef,
	playing,
	rewind,
	back10,
	forward10,
	toggle,
	switchRate,
	currentRate,
	loading,
	mount,
}) => {
	useEffect(() => {
		mount();
	}, [mount]);
	return (
		<div className="w-full max-w-4xl">
			<audio ref={playerRef} />
			<div className="flex items-center rounded-md bg-neutral-900 p-2 text-slate-100 md:p-4">
				<div className="flex flex-auto items-center justify-evenly">
					<button
						type="button"
						className="flex size-12 items-center justify-center rounded-full active:bg-neutral-700"
						onClick={rewind}
						aria-label="Previous"
						disabled={loading}
					>
						<PrevIcon />
					</button>
					<button
						type="button"
						className="flex size-12 items-center justify-center rounded-full active:bg-neutral-700"
						onClick={back10}
						aria-label="Rewind 10 seconds"
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
						className="flex size-12 items-center justify-center rounded-full active:bg-neutral-700"
						onClick={forward10}
						aria-label="Skip 10 seconds"
						disabled={loading}
					>
						<SkipIcon />
					</button>
					<button
						type="button"
						className="flex size-12 items-center justify-center rounded-full font-bold active:bg-neutral-700"
						onClick={switchRate}
						aria-label="Change playback rate"
						disabled={loading}
					>
						{currentRate}x
					</button>
				</div>
			</div>
		</div>
	);
};
