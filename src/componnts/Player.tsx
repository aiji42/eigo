import { FC, useEffect } from 'react';

export type PlayerProps = {
	playerRef: React.RefObject<HTMLAudioElement>;
	playing: boolean;
	toggle: () => void;
	mount: () => void;
};

export const Player: FC<PlayerProps> = ({ playerRef, playing, toggle, mount }) => {
	useEffect(() => {
		mount();
	}, [mount]);
	return (
		<div>
			<audio ref={playerRef} />
			<button onClick={toggle} className="rounded-md bg-blue-500 px-4 py-2 text-white">
				{playing ? <PauseIcon /> : <PlayIcon />}
			</button>
		</div>
	);
};

const PlayIcon = () => {
	return <span className="text-4xl">▶</span>;
};

const PauseIcon = () => {
	return <span className="text-4xl">II</span>;
};
