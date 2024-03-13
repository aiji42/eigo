import { Entry, CalibratedEntry } from '../schema';
import { useEffect, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { getJson, getJsonNoError, postJson } from '../libs/utils';
import useSWRMutation from 'swr/mutation';

type Key = { entryId: string | undefined; level: string | null };

export const useEntry = ({ entryId, level }: Key, refreshUntil: (entry: Entry | CalibratedEntry | undefined) => boolean) => {
	const [refreshInterval, setRefreshInterval] = useState(0);
	const { data: entry, isValidating } = useSWRImmutable(
		level ? `/api/calibrated-entry/${entryId}/${level}` : `/api/entry/${entryId}`,
		getJson<Entry | CalibratedEntry>,
		{ refreshInterval, suspense: true },
	);
	useEffect(() => {
		if (refreshUntil(entry)) setRefreshInterval(1000);
		else setRefreshInterval(0);
	}, [entry, refreshUntil]);

	const { data: nextEntry } = useSWRImmutable(`/api/next-entry/${entryId}`, getJsonNoError<Entry>, { suspense: true });
	const { data: prevEntry } = useSWRImmutable(`/api/prev-entry/${entryId}`, getJsonNoError<Entry>, { suspense: true });
	const { data: calibratedEntry } = useSWRImmutable(`/api/calibrated-entry/${entryId}/A1`, getJsonNoError<Entry>, { suspense: true });

	const { isMutating, trigger } = useSWRMutation(
		calibratedEntry ? null : `/api/calibrated-entry/${entryId}/A1`,
		postJson<CalibratedEntry>,
		{ populateCache: true },
	);

	return {
		entry,
		nextEntryId: nextEntry?.id ?? null,
		prevEntryId: prevEntry?.id ?? null,
		hasCalibratedEntry: !!calibratedEntry,
		isValidating,
		calibrate: trigger,
		isCalibrating: isMutating,
	};
};
