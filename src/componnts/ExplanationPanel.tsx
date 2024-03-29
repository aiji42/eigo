import { FC } from 'react';
import { useExplanation } from '../hooks/useExplanation';

export const ExplanationPanel: FC<{ text?: string | null }> = ({ text }) => {
	const { data } = useExplanation(text ?? null);

	if (!data || Object.entries(data).length < 1) return null;

	return (
		<div className="p-2 pt-4">
			<ul>
				{Object.entries(data).map(([key, val]) => (
					<li key={key}>
						<span className="mr-4 font-serif text-xl text-neutral-900">{key}:</span>
						<span className="text-lg text-neutral-500">{val}</span>
					</li>
				))}
			</ul>
		</div>
	);
};
