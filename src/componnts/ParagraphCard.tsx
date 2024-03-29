import { FC, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { useExplanation } from '../hooks/useExplanation';

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

	useEffect(() => {
		if (!!activeSentenceKey && scrollInActive) {
			ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, [!!activeSentenceKey, scrollInActive]);

	return (
		<div className="scroll-mt-[calc(3.5rem+env(safe-area-inset-top))] hyphens-auto break-words p-2 font-serif text-neutral-500" ref={ref}>
			{paragraph.sentences.map(({ text, key }, index) => (
				<Sentence text={text} active={key === activeSentenceKey} key={key} shouldPrepareExplanation={!!activeSentenceKey || index === 0} />
			))}
		</div>
	);
};

const Sentence = ({ text, active, shouldPrepareExplanation }: { text: string; active: boolean; shouldPrepareExplanation: boolean }) => {
	return (
		<div className="relative inline">
			<span className={clsx(active && 'text-neutral-900')} lang="en">
				{text}
				{!text.endsWith(' ') && ' '}
			</span>
			{(shouldPrepareExplanation || active) && <ExplanationTooltip text={text} show={active} />}
		</div>
	);
};

const ExplanationTooltip: FC<{ text: string; show: boolean }> = ({ text, show }) => {
	const { data } = useExplanation(text);

	if (!data || Object.entries(data).length < 1 || !show) return null;

	return (
		<div className="absolute right-auto top-full z-10 w-max rounded-md border-2 border-neutral-700 bg-neutral-100 p-2 shadow-md">
			<ul>
				{Object.entries(data).map(([key, val]) => (
					<li key={key}>
						<span className="mr-4 font-serif text-xl font-bold">{key}:</span>
						<span className="text-lg text-neutral-500">{val}</span>
					</li>
				))}
			</ul>
		</div>
	);
};
