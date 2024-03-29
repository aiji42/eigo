import { FC, useEffect, useRef } from 'react';
import { clsx } from 'clsx';

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
		<p className="scroll-mt-[calc(3.5rem+env(safe-area-inset-top))] hyphens-auto break-words p-2 font-serif text-neutral-500" ref={ref}>
			{paragraph.sentences.map(({ text, key }, index) => (
				<Sentence text={text} active={key === activeSentenceKey} key={key} />
			))}
		</p>
	);
};

const Sentence = ({ text, active }: { text: string; active: boolean }) => {
	return (
		<span className={clsx(active && 'text-neutral-900')} lang="en">
			{text}{' '}
		</span>
	);
};
