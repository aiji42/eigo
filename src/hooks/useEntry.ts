import { useEffect, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { isCEFRLevel } from '../libs/utils';
import { hc } from 'hono/client';
import { ApiEntry } from '../routes/api/entry';
import { InferRequestType, InferResponseType } from 'hono';

const client = hc<ApiEntry>('/api/entry');
const entryGet = client[':id'].$get;
const calibratedEntryGet = client[':id'][':level'].$get;

const fetcher = async (arg: InferRequestType<typeof entryGet | typeof calibratedEntryGet>['param']) => {
	if ('level' in arg && isCEFRLevel(arg.level)) {
		const res = await calibratedEntryGet({ param: arg });
		return await res.json();
	}
	const res = await entryGet({ param: arg });
	return await res.json();
};

export type EntryData = InferResponseType<typeof entryGet | typeof calibratedEntryGet>;
type Key = { entryId: string | undefined; level: string | null };

export const useEntry = ({ entryId, level }: Key, refreshUntil: (entry: EntryData) => boolean) => {
	const [refreshInterval, setRefreshInterval] = useState(0);
	const { data: entry, isValidating } = useSWRImmutable({ id: entryId, level }, fetcher, { refreshInterval, suspense: true });

	useEffect(() => {
		if (refreshUntil(entry)) setRefreshInterval(1000);
		else setRefreshInterval(0);
	}, [entry, refreshUntil]);

	return { entry, isValidating };
};
