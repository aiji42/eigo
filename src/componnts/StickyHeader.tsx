import { Link } from 'react-router-dom';
import { FC, ReactNode } from 'react';
import { clsx } from 'clsx';
import { isCEFRLevel } from '../libs/utils';
import { useLevel } from '../hooks/useLevel';

type StickyHeaderProps = {
	children?: ReactNode;
};

const levelColors = {
	A1: 'text-violet-100',
	A2: 'text-violet-200',
	B1: 'text-teal-100',
	B2: 'text-teal-200',
	C1: 'text-pink-100',
	C2: 'text-teal-200',
};

export const StickyHeader: FC<StickyHeaderProps> = ({ children }) => {
	const [currentLevel, setLevel] = useLevel();

	return (
		<header className="sticky left-0 right-0 top-0 z-10 flex min-h-12 w-full max-w-4xl items-center justify-between bg-neutral-950 p-2 pt-[calc(0.5rem+env(safe-area-inset-top))]">
			<div>
				<Link to="/">
					<h1 className="text-xl font-bold text-slate-300">Eigo</h1>
				</Link>
			</div>
			<div>
				{children}

				<select
					className={clsx('flex size-6 appearance-none bg-neutral-900 font-bold', currentLevel && levelColors[currentLevel])}
					onChange={(e) => setLevel(isCEFRLevel(e.target.value) ? e.target.value : null)}
				>
					{([null, 'A1', 'A2', 'B1'] as const).map((level) => (
						<option key={level} value={level ?? ''} selected={level === currentLevel}>
							{level ?? 'Og'}
						</option>
					))}
				</select>
			</div>
		</header>
	);
};
