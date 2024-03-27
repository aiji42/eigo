import { hc } from 'hono/client';
import { ApiExtractPhrases } from '../routes/api/extract-phrases';
import { CEFRLevel } from '../schema';
import useSWR from 'swr';

const client = hc<ApiExtractPhrases>('/api/extract-phrases');

const fetcher = async ({ id, level }: { id: string; level?: CEFRLevel }) => {
	const res = await client[':id'].$get({ param: { id }, query: { level } });
	return await res.json();
};

export const usePhrases = ({ entryId, level }: { entryId: string; level?: CEFRLevel | null }, execute: boolean) => {
	const { isLoading, data } = useSWR(execute ? { id: entryId, level: level ?? undefined } : null, fetcher);

	return { isLoading, phrases: data };
};
