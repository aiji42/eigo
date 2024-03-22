import { Player } from './Player';
import { useMediaControllerContext } from './MediaControllerContext';
import { useLocation } from 'react-router-dom';

export const StickyMediaController = () => {
	const { player, entry } = useMediaControllerContext();
	const location = useLocation();

	if (!player || !entry) return null;

	const mode = location.pathname === '/' || player.ended ? 'media' : 'control';

	return (
		<div className="fixed bottom-0 left-0 right-0 flex items-center justify-center bg-neutral-100 pb-safe">
			<Player {...player} entry={entry} mode={mode} />
		</div>
	);
};
