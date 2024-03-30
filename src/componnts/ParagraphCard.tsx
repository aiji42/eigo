import { FC, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { useExplanation } from '../hooks/useExplanation';
import { useToggleShowExplanation } from '../hooks/useToggleShowExplanation';

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
		<div
			className="scroll-mt-[calc(3.5rem+env(safe-area-inset-top))] overflow-x-clip hyphens-auto break-words p-2 font-serif text-neutral-400"
			ref={ref}
		>
			{paragraph.sentences.map(({ text, key }, index) => (
				<div className={clsx('relative inline', key === activeSentenceKey && 'text-neutral-900')} key={key} lang="en">
					{text}{' '}
					{key === activeSentenceKey && show && (
						<div className="absolute left-0 right-0 top-full z-10 mx-auto mt-1 w-max max-w-4xl">
							<ExplanationPanel text={text} />
						</div>
					)}
				</div>
			))}
		</div>
	);
};

const ExplanationPanel: FC<{ text?: string | null }> = ({ text }) => {
	const { data } = useExplanation(text ?? null);

	if (!data || Object.entries(data).length < 1) return null;

	return (
		<div className="rounded-md border-2 bg-neutral-100 p-2 shadow-md">
			<ul>
				{Object.entries(data).map(([key, val]) => (
					<li key={key}>
						<span className="mr-4 text-xl text-neutral-900">{key}:</span>
						<span className="text-lg text-neutral-500">{val}</span>
					</li>
				))}
			</ul>
		</div>
	);
};
