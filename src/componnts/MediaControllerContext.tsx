import { createContext, FC, ReactNode, useContext, useState } from 'react';
import { EntryData, usePlayer } from '../hooks/usePlayer';

type MediaContextType = {
	entry: null | EntryData;
	setEntry: (entry: null | EntryData) => void;
	player: ReturnType<typeof usePlayer> | null;
};

export const MediaControllerContext = createContext<MediaContextType>({
	entry: null,
	setEntry: () => {},
	player: null,
});

export const MediaControllerProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const [entry, setEntry] = useState<null | EntryData>(null);

	const player = usePlayer(entry);

	return <MediaControllerContext.Provider value={{ entry, setEntry, player }}>{children}</MediaControllerContext.Provider>;
};

export const useMediaControllerContext = () => {
	return useContext(MediaControllerContext);
};
