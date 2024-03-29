import { useLocalStorage } from '@rehooks/local-storage';
import { useCallback } from 'react';

export const useToggleShowExplanation = () => {
	const [value, setValue] = useLocalStorage<boolean>('showExplanation', false);

	const toggle = useCallback(() => setValue(!value), [setValue, value]);

	return [value, toggle] as const;
};
