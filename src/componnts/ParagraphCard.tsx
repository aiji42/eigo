import { FC, useEffect, useRef } from 'react';
import { clsx } from 'clsx';

type ParagraphCardProps = {
	paragraph: {
		sentences: {
			text: string;
			key: string;
		}[];
	};
	scrollInActive?: boolean;
	activeSentenceKey?: string;
	showTranslation?: boolean;
};

export const ParagraphCard: FC<ParagraphCardProps> = ({ paragraph, activeSentenceKey, scrollInActive, showTranslation }) => {
	const ref = useRef<HTMLParagraphElement>(null);

	useEffect(() => {
		if (!!activeSentenceKey && scrollInActive) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}, [!!activeSentenceKey, scrollInActive]);

	return (
		<p className={clsx('scroll-mt-24 hyphens-auto break-words p-2 text-gray-500', showTranslation && 'opacity-75')} ref={ref}>
			{paragraph.sentences.map(({ text, key }) => (
				<span key={key} className={clsx(key === activeSentenceKey && 'text-slate-100')} lang="en">
					{text}
				</span>
			))}
		</p>
	);
};
