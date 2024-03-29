import { hc } from 'hono/client';
import { ApiExtractPhrases } from '../routes/api/extract-phrases';
import useSWR from 'swr';

const client = hc<ApiExtractPhrases>('/api/extract-phrases');

const fetcher = async (text: string) => {
	const res = await client.index.$post({ json: { text } });
	return await res.json();
};

export const useExplanation = (text: string | null) => {
	const { data, isLoading } = useSWR(text, fetcher);

	return { data, isLoading };
};
