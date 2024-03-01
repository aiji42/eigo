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
		<p className={clsx('scroll-mt-32 hyphens-auto break-words rounded-md p-2', activeSentenceKey && 'bg-neutral-800')} ref={ref}>
			{paragraph.sentences.map(({ text, key }) => (
				<span key={key} className={clsx(key === activeSentenceKey && 'text-green-600')} lang="en">
					{text}
				</span>
			))}
		</p>
	);
};
