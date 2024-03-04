import { Entry } from '../schema';
import { useEffect, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { getJson } from '../libs/utils';

export const useEntry = (entryId: string | undefined, refreshUntil: (entry: Entry | undefined) => boolean) => {
	const [refreshInterval, setRefreshInterval] = useState(0);
	const { data, isLoading, isValidating } = useSWRImmutable<Entry>(`/api/entry/${entryId}`, getJson, { refreshInterval });
	useEffect(() => {
		if (refreshUntil(data)) setRefreshInterval(1000);
		else setRefreshInterval(0);
	}, [data, refreshUntil]);

	return { entry: data, isLoading, isValidating };
};
