import { Link } from 'react-router-dom';
import { FC, ReactNode } from 'react';
import { clsx } from 'clsx';
import { isCEFRLevel } from '../libs/utils';
import { useLevel } from '../hooks/useLevel';
import { useToggleShowExplanation } from '../hooks/useToggleShowExplanation';
import { SubtitlesIcon } from './Icons';

type StickyHeaderProps = {
	children?: ReactNode;
	onlyLogo?: boolean;
};

const levelColors = {
	Og: 'from-slate-600 to-slate-400',
	A1: 'from-pink-600 to-pink-300',
	A2: 'from-violet-600 to-pink-300',
	B1: 'from-cyan-600 to-emerald-300',
	B2: 'text-teal-200',
	C1: 'text-pink-100',
	C2: 'text-teal-200',
};

export const StickyHeader: FC<StickyHeaderProps> = ({ children, onlyLogo }) => {
	const [currentLevel, setLevel] = useLevel();
	const [show, toggle] = useToggleShowExplanation();

	return (
		<header className="sticky left-0 right-0 top-0 z-10 flex min-h-12 w-full max-w-4xl items-center justify-between bg-neutral-50 p-2 pt-[calc(0.5rem+env(safe-area-inset-top))]">
			<div>
				<Link to="/">
					<h1 className="text-xl font-bold">
						🌎 <span className="bg-transparent bg-gradient-to-tr from-slate-600 to-slate-400 bg-clip-text text-transparent">Eigo</span>
					</h1>
				</Link>
			</div>
			{!onlyLogo && (
				<div className="flex h-10 items-center gap-4">
					{children}
					<button onClick={toggle} className="m-auto" aria-label={show ? 'Show explanation' : 'Hide explanation'}>
						<SubtitlesIcon
							className={clsx(
								'text-4xl',
								show ? 'bg-transparent bg-gradient-to-tr from-sky-600 to-cyan-400 bg-clip-text text-transparent' : 'text-neutral-500',
							)}
						/>
					</button>
					<select
						className={clsx(
							'appearance-none rounded-md bg-purple-600 bg-transparent bg-gradient-to-tr px-2 py-0.5 text-center font-mono font-bold text-neutral-50',
							levelColors[currentLevel ?? 'Og'],
						)}
						onChange={(e) => setLevel(isCEFRLevel(e.target.value) ? e.target.value : null)}
						value={currentLevel ?? ''}
						aria-label="Select CEFR level"
					>
						{([null, 'A1', 'A2', 'B1'] as const).map((level) => (
							<option key={level} value={level ?? ''}>
								{level ?? 'Og'}
							</option>
						))}
					</select>
				</div>
			)}
		</header>
	);
};
