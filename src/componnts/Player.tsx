import { FC, useEffect } from 'react';
import { clsx } from 'clsx';

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
};

export const Player: FC<PlayerProps> = ({ playerRef, playing, rewind, back10, forward10, toggle, switchRate, currentRate, mount }) => {
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
					>
						<PrevIcon />
					</button>
					<button
						type="button"
						className="flex size-12 items-center justify-center rounded-full active:bg-neutral-700"
						onClick={back10}
						aria-label="Rewind 10 seconds"
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
				>
					{playing ? <PauseIcon /> : <PlayIcon />}
				</button>
				<div className="flex flex-auto items-center justify-evenly">
					<button
						type="button"
						className="flex size-12 items-center justify-center rounded-full active:bg-neutral-700"
						onClick={forward10}
						aria-label="Skip 10 seconds"
					>
						<SkipIcon />
					</button>
					<button
						type="button"
						className="flex size-12 items-center justify-center rounded-full font-bold active:bg-neutral-700"
						onClick={switchRate}
						aria-label="Change playback rate"
					>
						{currentRate}x
					</button>
				</div>
			</div>
		</div>
	);
};

const PrevIcon = () => {
	return (
		<svg width="24" height="24" fill="none">
			<path
				d="m10 12 8-6v12l-8-6Z"
				fill="currentColor"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path d="M6 6v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
};

const RewindIcon = () => {
	return (
		<svg width="24" height="24" fill="none">
			<path
				d="M6.492 16.95c2.861 2.733 7.5 2.733 10.362 0 2.861-2.734 2.861-7.166 0-9.9-2.862-2.733-7.501-2.733-10.362 0A7.096 7.096 0 0 0 5.5 8.226"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path d="M5 5v3.111c0 .491.398.889.889.889H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
};

const SkipIcon = () => {
	return (
		<svg width="24" height="24" fill="none">
			<path
				d="M17.509 16.95c-2.862 2.733-7.501 2.733-10.363 0-2.861-2.734-2.861-7.166 0-9.9 2.862-2.733 7.501-2.733 10.363 0 .38.365.711.759.991 1.176"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M19 5v3.111c0 .491-.398.889-.889.889H15"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
};

const PlayIcon = () => {
	return (
		<svg width="30" height="32" fill="currentColor" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
			<path d="M 9,5 L 26,16 L 9,27 Z" />
		</svg>
	);
};

const PauseIcon = () => {
	return (
		<svg width="30" height="32" fill="currentColor">
			<rect x="3" y="4" width="8" height="24" rx="2" />
			<rect x="19" y="4" width="8" height="24" rx="2" />
		</svg>
	);
};
