import { Player } from './Player';
import { useMediaControllerContext } from './MediaControllerContext';

export const StickyMediaController = () => {
	const { player } = useMediaControllerContext();

	if (!player) return null;

	return (
		<div className="fixed bottom-0 left-0 right-0 flex items-center justify-center bg-neutral-100 pb-safe">
			<Player {...player} />
		</div>
	);
};
