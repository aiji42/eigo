import { useEffect, useRef, useState } from 'react';

export const useAwakeScreen = (awake = false) => {
	const ref = useRef<WakeLockSentinel | null>(null);
	const [acquired, setAcquired] = useState(false);

	useEffect(() => {
		if (!('wakeLock' in navigator)) return;

		const requestAwake = async () => {
			try {
				const sentinel = await navigator.wakeLock.request('screen');
				setAcquired(true);
				return sentinel;
			} catch (e) {
				setAcquired(false);
				return null;
			}
		};

		const visibilitychange = async () => {
			if (ref.current && document.visibilityState === 'visible' && awake) ref.current = await requestAwake();
		};
		document.addEventListener('visibilitychange', visibilitychange);

		if (awake) requestAwake().then((sentinel) => (ref.current = sentinel));

		const release = () => setAcquired(false);
		ref.current?.addEventListener('release', release);

		return () => {
			ref.current?.removeEventListener('release', release);
			ref.current?.release().then(() => {
				ref.current && (ref.current = null);
				setAcquired(false);
			});
			document.removeEventListener('visibilitychange', visibilitychange);
		};
	}, [awake]);

	return acquired;
};
