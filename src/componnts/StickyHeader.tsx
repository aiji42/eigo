import { Link } from 'react-router-dom';
import { FC, ReactNode } from 'react';
import { clsx } from 'clsx';
import { isCEFRLevel } from '../libs/utils';
import { useLevel } from '../hooks/useLevel';
import { LoadingIcon } from './Icons';

type StickyHeaderProps = {
	children?: ReactNode;
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

export const StickyHeader: FC<StickyHeaderProps> = ({ children }) => {
	const [currentLevel, setLevel] = useLevel();

	return (
		<header className="sticky left-0 right-0 top-0 z-10 flex min-h-12 w-full max-w-4xl items-center justify-between bg-neutral-50 p-2 pt-[calc(0.5rem+env(safe-area-inset-top))]">
			<div>
				<Link to="/">
					<h1 className="text-xl font-bold">
						🌎 <span className="bg-transparent bg-gradient-to-tr from-slate-600 to-slate-400 bg-clip-text text-transparent">Eigo</span>
					</h1>
				</Link>
			</div>
			<div>
				{children}
				{/* TODO: リストページにプレイヤーが侵食したことで、リストページで再生中エントリーのcalibrate前のレベルを選択するとプレイリストが404になるので無限ローディングになる。 */}
				{/* 強制的に該当のentryを開いてあげることで回避したいが、再生中でなければリストページにとどまればいいので、player側で制御すべき？ */}
				<select
					className={clsx(
						'appearance-none rounded-md bg-purple-600 bg-transparent bg-gradient-to-tr px-2 py-0.5 text-center font-mono font-bold text-neutral-50',
						levelColors[currentLevel ?? 'Og'],
					)}
					onChange={(e) => setLevel(isCEFRLevel(e.target.value) ? e.target.value : null)}
					value={currentLevel ?? ''}
				>
					{([null, 'A1', 'A2', 'B1'] as const).map((level) => (
						<option key={level} value={level ?? ''}>
							{level ?? 'Og'}
						</option>
					))}
				</select>
			</div>
		</header>
	);
};
