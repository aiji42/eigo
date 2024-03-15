import { Link } from 'react-router-dom';
import { FC, ReactNode } from 'react';

type StickyHeaderProps = {
	children?: ReactNode;
};

export const StickyHeader: FC<StickyHeaderProps> = ({ children }) => {
	return (
		<header className="sticky left-0 right-0 top-0 z-10 flex min-h-12 w-full max-w-4xl items-center justify-between bg-neutral-950 p-2 pt-[calc(0.5rem+env(safe-area-inset-top))]">
			<div>
				<Link to="/">
					<h1 className="text-xl font-bold text-slate-300">Eigo</h1>
				</Link>
			</div>
			<div>{children}</div>
		</header>
	);
};
