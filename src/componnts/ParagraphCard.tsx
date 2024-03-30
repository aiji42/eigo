import { FC, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { useExplanation } from '../hooks/useExplanation';
import { useToggleShowExplanation } from '../hooks/useToggleShowExplanation';
import { useFloating, autoUpdate, shift, size, offset, flip } from '@floating-ui/react';

type ParagraphCardProps = {
	paragraph: {
		key: string;
		sentences: {
			text: string;
			key: string;
		}[];
	};
	scrollInActive?: boolean;
	activeSentenceKey?: string;
};

export const ParagraphCard: FC<ParagraphCardProps> = ({ paragraph, activeSentenceKey, scrollInActive }) => {
	const ref = useRef<HTMLParagraphElement>(null);

	const [show] = useToggleShowExplanation();

	useEffect(() => {
		if (!!activeSentenceKey && scrollInActive) {
			ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, [!!activeSentenceKey, scrollInActive]);

	return (
		<div className="scroll-mt-[calc(3.5rem+env(safe-area-inset-top))] hyphens-auto break-words p-2 font-serif text-neutral-400" ref={ref}>
			{paragraph.sentences.map(({ text, key }, index) => {
				const active = key === activeSentenceKey;
				return <Sentence text={text} active={active} key={key} />;
			})}
		</div>
	);
};

const Sentence: FC<{ text: string; active?: boolean }> = ({ text, active }) => {
	const [showExp] = useToggleShowExplanation();
	const { data } = useExplanation(active && showExp ? text : null);
	const { refs, floatingStyles, context } = useFloating({
		whileElementsMounted: autoUpdate,
		middleware: [
			shift({
				padding: 4,
			}),
			size({
				apply({ availableWidth, elements }) {
					Object.assign(elements.floating.style, {
						maxWidth: `${availableWidth - 8}px`,
					});
				},
			}),
			offset(4),
			flip(),
		],
		open: !!data,
	});
	return (
		<>
			<span className={clsx(active && 'text-neutral-900')} lang="en" ref={refs.setReference}>
				{text}{' '}
			</span>
			{data && Object.values(data).length && (
				<div className="z-10 rounded-md border-2 border-sky-400 bg-neutral-100 p-1 shadow-lg" ref={refs.setFloating} style={floatingStyles}>
					<ul>
						{Object.entries(data).map(([key, val]) => (
							<li key={key}>
								<span className="mr-4 text-xl text-neutral-900">{key}:</span>
								<span className="text-lg text-neutral-500">{val} </span>
							</li>
						))}
					</ul>
				</div>
			)}
		</>
	);
};
