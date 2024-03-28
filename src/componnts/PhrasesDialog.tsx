import { useEffect } from 'react';
import { CloseIcon, DictionaryIcon, LoadingIcon } from './Icons';
import { useParams } from 'react-router-dom';
import { useLevel } from '../hooks/useLevel';
import { useMediaControllerContext } from './MediaControllerContext';
import { usePhrases } from '../hooks/usePhrases';
import { useDialog } from '../hooks/useDialog';

export const PhrasesDialog = () => {
	const { dialogRef, openModal, closeModal, isOpening } = useDialog();
	const { entryId = '' } = useParams<'entryId'>();
	const [level] = useLevel();
	const { isLoading, phrases } = usePhrases({ entryId, level }, isOpening);
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
							{Object.entries(phrases ?? {}).map(([key, value], index) => (
								<div key={index} className="pb-3">
									<dt className="font-serif text-xl font-bold">{key}</dt>
									<dd className="text-lg text-neutral-500">{value}</dd>
								</div>
							))}
						</dl>
					</div>
				</div>
			</dialog>
		</>
	);
};
