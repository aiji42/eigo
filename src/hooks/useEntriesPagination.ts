import { hc } from 'hono/client';
import { ApiList } from '../routes/api/list';
import { Entry } from '../schema';
import { InferRequestType } from 'hono';
import useSWRInfinite from 'swr/infinite';
import { useCallback, useRef } from 'react';

const client = hc<ApiList>('/api/list');

const getKey = (size: number) => (page: number, previousPageData: Entry[][]) => {
	if (previousPageData && !previousPageData.length) return null;
	return {
		query: {
			offset: page * size,
			size,
		},
	};
};

const fetcher = async (arg: InferRequestType<typeof client.index.$get>) => {
	const res = await client.index.$get(arg);
	return await res.json();
};

export const useEntriesPagination = (_limit: number = 10) => {
	const limit = useRef(_limit);
	const { data, setSize, isValidating } = useSWRInfinite(getKey(limit.current), fetcher, {
		suspense: true,
	});

	const next = useCallback(async () => {
		const hasMore = (data?.at(-1)?.length ?? 0) >= limit.current;
		if (isValidating || !hasMore) return;
		await setSize((c) => c + 1);
	}, [isValidating, data, setSize]);

	return { data, isValidating, next };
};
