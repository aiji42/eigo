import { useCallback, useEffect, useRef, useState } from 'react';
import { CloseIcon, DictionaryIcon, LoadingIcon } from './Icons';
import useSWR from 'swr';
import { useParams } from 'react-router-dom';
import { useLevel } from '../hooks/useLevel';
import { getJson } from '../libs/utils';
import { Phrase } from '../service-bindings/libs/extractPhrases';
import { useMediaControllerContext } from './MediaControllerContext';

export const PhrasesDialog = () => {
	const { dialogRef, openModal, closeModal, isOpening } = useDialog();
	const { entryId } = useParams<'entryId'>();
	const [level] = useLevel();
	const { isLoading, data } = useSWR(isOpening ? `/api/extract-phrases/${entryId}?level=${level}` : null, getJson<Phrase[]>);
	const { player } = useMediaControllerContext();

	useEffect(() => {
		if (player?.playing) closeModal();
	}, [player?.playing, closeModal]);

	// ダイアログを開いたときに再生を一時停止し、閉じたときに再生を再開する
	useEffect(() => {
		if (isOpening && player?.getPlaying()) {
			player.pause();
			return () => {
				player.play();
			};
		}
	}, [isOpening, player?.getPlaying, player?.pause, player?.play]);

	if (!entryId) return null;

	return (
		<>
			<button onClick={openModal} className="m-auto">
				<DictionaryIcon className="text-4xl text-neutral-500 active:text-neutral-400" />
			</button>
			<dialog ref={dialogRef} className="fixed right-0 top-0 w-full rounded-md bg-neutral-50 shadow-sm md:max-w-3xl">
				<div className="flex flex-col">
					<div className="sticky top-0 z-10 flex justify-between border-b bg-neutral-50 p-4">
						<h2 className="text-xl font-bold">Phrases in this entry</h2>
						<button onClick={closeModal}>
							<CloseIcon className="text-base text-neutral-500 active:text-neutral-400" />
						</button>
					</div>
					<div className="relative min-h-80 p-4">
						{isLoading && <LoadingIcon />}
						<dl>
							{data?.map(({ target, meaning }, index) => (
								<div key={index} className="pb-3">
									<dt className="font-serif text-xl font-bold">{target}</dt>
									<dd className="text-lg text-neutral-500">{meaning}</dd>
								</div>
							))}
						</dl>
					</div>
				</div>
			</dialog>
		</>
	);
};

const useDialog = () => {
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
