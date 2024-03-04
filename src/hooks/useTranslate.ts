import { Content, joinSentences } from '../libs/content';
import { useReducer } from 'react';
import useSWRImmutable from 'swr/immutable';
import { postJson } from '../libs/utils';

export const useTranslate = (content: undefined | Content) => {
	const [translatingKey, translate] = useReducer((currentKey: string | null, key: string | null) => {
		if (currentKey === key) return null;
		return key;
	}, null);

	const { data: translated, isLoading } = useSWRImmutable(translatingKey, async (key): Promise<{ translated: string }> => {
		const paragraph = content?.find((p) => p.key === key);
		if (!paragraph) throw new Error(`paragraph not found by key: ${key}`);
		const text = joinSentences(paragraph);
		return postJson('/api/translate', { text });
	});

	return { translated, isLoading, translate, translatingKey };
};
