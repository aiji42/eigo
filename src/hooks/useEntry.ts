import { Entry, CalibratedEntry } from '../schema';
import { useEffect, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { getJson } from '../libs/utils';

type Data = (Entry | CalibratedEntry) & {
	next: Entry | null;
	prev: Entry | null;
};
type Key = { entryId: string | undefined; level: string | null };

export const useEntry = ({ entryId, level }: Key, refreshUntil: (entry: Data) => boolean) => {
	const [refreshInterval, setRefreshInterval] = useState(0);
	const { data: entry, isValidating } = useSWRImmutable(
		level ? `/api/calibrated-entry/${entryId}/${level}` : `/api/entry/${entryId}`,
		getJson<Data>,
		{ refreshInterval, suspense: true },
	);

	useEffect(() => {
		if (refreshUntil(entry)) setRefreshInterval(1000);
		else setRefreshInterval(0);
	}, [entry, refreshUntil]);

	return { entry, isValidating };
};
