import { Entry, CalibratedEntry } from '../schema';
import { useEffect, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { getJson, getJsonNoError, postJson } from '../libs/utils';
import useSWRMutation from 'swr/mutation';

type Data = (Entry | CalibratedEntry) & { nextEntryId: string | null; prevEntryId: string | null };
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

	const { data: calibratedEntry } = useSWRImmutable(`/api/calibrated-entry/${entryId}/A1`, getJsonNoError<Exclude<Data, Entry>>, {
		suspense: true,
	});

	const { isMutating, trigger } = useSWRMutation(
		calibratedEntry ? null : `/api/calibrated-entry/${entryId}/A1`,
		postJson<Exclude<Data, Entry>>,
		{ populateCache: true },
	);

	return {
		entry,
		hasCalibratedEntry: !!calibratedEntry,
		isValidating,
		calibrate: trigger,
		isCalibrating: isMutating,
	};
};
