import { useCallback, useEffect, useRef, useState } from 'react';

export const useDialog = () => {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const [isOpening, setIsOpening] = useState(false);
	const [trigger, setTrigger] = useState<Element | null>(null);

	const openModal = useCallback(() => {
		if (dialogRef.current) {
			setTrigger(document.activeElement);
			dialogRef.current?.showModal();
			setIsOpening(true);
			document.body.style.overflow = 'hidden';
		}
	}, []);

	const closeModal = useCallback(() => {
		if (dialogRef.current) {
			dialogRef.current.close();
			setIsOpening(false);
			if (trigger && 'focus' in trigger && typeof trigger.focus === 'function') trigger.focus();
			document.body.style.overflow = '';
		}
	}, [trigger]);

	// close dialog when click outside
	useEffect(() => {
		const dialogEl = dialogRef.current;

		const handleBackdropClick = (event: MouseEvent) => {
			if (event.target === dialogEl && event.target !== dialogEl?.firstChild) {
				closeModal();
			}
		};

		dialogEl?.addEventListener('click', handleBackdropClick);
		return () => {
			dialogEl?.removeEventListener('click', handleBackdropClick);
		};
	}, [closeModal]);

	return { dialogRef, openModal, closeModal, isOpening };
};
