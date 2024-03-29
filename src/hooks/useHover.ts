import { RefObject, useEffect, useState } from 'react';

export const useHover = (ref: RefObject<Element>) => {
	const [value, setValue] = useState(false);

	useEffect(() => {
		const onMouseOver = () => setValue(true);
		const onMouseOut = () => setValue(false);

		if (ref.current) {
			ref.current.addEventListener('mouseover', onMouseOver);
			ref.current.addEventListener('mouseout', onMouseOut);
		}

		const { current } = ref;

		return () => {
			if (current) {
				current.removeEventListener('mouseover', onMouseOver);
				current.removeEventListener('mouseout', onMouseOut);
			}
		};
	}, [ref]);

	return value;
};
