import { hc } from 'hono/client';
import { ApiExtractPhrases } from '../routes/api/extract-phrases';
import useSWRImmutable from 'swr/immutable';

const client = hc<ApiExtractPhrases>('/api/extract-phrases');

const fetcher = async (text: string) => {
	const res = await client.index.$post({ json: { text } });
	return await res.json();
};

export const useExplanation = (text: string | null) => {
	const { data, isLoading } = useSWRImmutable(text, fetcher);

	return { data, isLoading };
};
