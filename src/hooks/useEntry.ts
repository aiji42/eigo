import { useEffect, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { isCEFRLevel } from '../libs/utils';
import { hc } from 'hono/client';
import { ApiEntry } from '../routes/api/entry';
import { InferResponseType } from 'hono';

type Key = { entryId: string; level: string | null };

const client = hc<ApiEntry>('/api/entry');
const entryGet = client[':id'].$get;
const calibratedEntryGet = client[':id'][':level'].$get;

const fetcher = async ({ entryId: id, level }: Key) => {
	if (isCEFRLevel(level)) {
		const res = await calibratedEntryGet({ param: { id, level } });
		return await res.json();
	}
	const res = await entryGet({ param: { id } });
	return await res.json();
};

export type EntryData = InferResponseType<typeof entryGet | typeof calibratedEntryGet>;

export const useEntry = (key: Key, refreshUntil: (entry: EntryData) => boolean) => {
	const [refreshInterval, setRefreshInterval] = useState(0);
	const { data: entry, isValidating } = useSWRImmutable(key, fetcher, { refreshInterval, suspense: true });

	useEffect(() => {
		if (refreshUntil(entry)) setRefreshInterval(1000);
		else setRefreshInterval(0);
	}, [entry, refreshUntil]);

	return { entry, isValidating };
};
