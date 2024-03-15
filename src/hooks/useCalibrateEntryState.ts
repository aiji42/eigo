import { CalibratedEntry, CEFRLevel } from '../schema';
import useSWRImmutable from 'swr/immutable';
import { getJsonNoError, postJson } from '../libs/utils';
import useSWRMutation from 'swr/mutation';

export const useCalibrateEntryState = (entryId: string | undefined, level: CEFRLevel) => {
	const { data } = useSWRImmutable(`/api/calibrated-entry/${entryId}/${level}`, getJsonNoError<CalibratedEntry>, {
		suspense: true,
	});

	const { isMutating, trigger } = useSWRMutation(data ? null : `/api/calibrated-entry/${entryId}/${level}`, postJson<CalibratedEntry>, {
		populateCache: true,
	});

	return {
		isCalibrated: !!data,
		isCalibrating: isMutating,
		calibrate: trigger,
	};
};
