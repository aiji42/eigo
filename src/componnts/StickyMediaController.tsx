import { Player } from './Player';
import { useMediaControllerContext } from './MediaControllerContext';
import { useLocation } from 'react-router-dom';
import { useToggleShowExplanation } from '../hooks/useToggleShowExplanation';

export const StickyMediaController = () => {
	const { player, entry } = useMediaControllerContext();
	const location = useLocation();
	const [showExplanation, onClickShowExplanation] = useToggleShowExplanation();

	if (!player || !entry) return null;

	const mode = location.pathname === '/' || player.ended ? 'media' : 'control';

	return (
		<div className="fixed bottom-0 left-0 right-0 flex items-center justify-center pb-safe">
			<Player {...player} entry={entry} mode={mode} showExplanation={showExplanation} onClickShowExplanation={onClickShowExplanation} />
		</div>
	);
};
