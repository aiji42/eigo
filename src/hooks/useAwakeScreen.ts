import { useEffect, useRef } from 'react';

export const useAwakeScreen = (awake = false) => {
	const ref = useRef<WakeLockSentinel | null>(null);

	useEffect(() => {
		if (!('wakeLock' in navigator)) return;

		const visibilitychange = async () => {
			if (document.visibilityState === 'visible' && awake) ref.current = await navigator.wakeLock.request('screen');
		};
		document.addEventListener('visibilitychange', visibilitychange);

		if (awake)
			navigator.wakeLock.request('screen').then((wakeLock) => {
				ref.current = wakeLock;
			});

		return () => {
			ref.current?.release().then(() => ref.current && (ref.current = null));
			document.removeEventListener('visibilitychange', visibilitychange);
		};
	}, [awake]);
};
