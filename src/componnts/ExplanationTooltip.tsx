import { FC } from 'react';
import { useExplanation } from '../hooks/useExplanation';

export const ExplanationTooltip: FC<{ text: string; show?: boolean; preload?: boolean }> = ({ text, show, preload }) => {
	const { data } = useExplanation(preload || show ? text : null);

	if (!data || Object.entries(data).length < 1 || !show) return null;

	return (
		<div className="rounded-md border-2 border-neutral-700 bg-neutral-100 p-2 shadow-md">
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
