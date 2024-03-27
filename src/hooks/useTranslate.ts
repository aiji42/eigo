import { Content, joinSentences } from '../libs/content';
import { useReducer } from 'react';
import useSWRImmutable from 'swr/immutable';
import { hc } from 'hono/client';
import { ApiTranslate } from '../routes/api/translate';

const client = hc<ApiTranslate>('/api/translate');

const makeFetcher = (content: undefined | Content) => async (key: string) => {
	const paragraph = content?.find((p) => p.key === key);
	if (!paragraph) throw new Error(`paragraph not found by key: ${key}`);
	const res = await client.index.$post({ json: { text: joinSentences(paragraph) } });
	return (await res.json()).translated;
};

export const useTranslate = (content: undefined | Content) => {
	const [translatingKey, translate] = useReducer((currentKey: string | null, key: string | null) => {
		if (currentKey === key) return null;
		return key;
	}, null);

	const { data: translated, isLoading } = useSWRImmutable(translatingKey, makeFetcher(content));

	return { translated, isLoading, translate, translatingKey };
};
