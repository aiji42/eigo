import { Entry } from '../schema';
import { useEffect, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { getJson } from '../libs/utils';

export const useEntry = (entryId: string | undefined, refreshUntil: (entry: Entry | undefined) => boolean) => {
	const [refreshInterval, setRefreshInterval] = useState(0);
	const { data, isLoading, isValidating } = useSWRImmutable<Entry & { nextEntryId: number | null; prevEntryId: number | null }>(
		entryId,
		async (key) => {
			const entryPromise = getJson<Entry>(`/api/entry/${key}`);
			const nextEntryPromise = getJson<Entry>(`/api/next-entry/${key}`).catch(() => null);
			const prevEntryPromise = getJson<Entry>(`/api/prev-entry/${key}`).catch(() => null);
			return {
				...(await entryPromise),
				nextEntryId: (await nextEntryPromise)?.id ?? null,
				prevEntryId: (await prevEntryPromise)?.id ?? null,
			};
		},
		{ refreshInterval },
	);
	useEffect(() => {
		if (refreshUntil(data)) setRefreshInterval(1000);
		else setRefreshInterval(0);
	}, [data, refreshUntil]);

	return { entry: data, isLoading, isValidating };
};
