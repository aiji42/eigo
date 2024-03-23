import { createContext, FC, ReactNode, useContext, useState } from 'react';
import { EntryData, usePlayer } from '../hooks/usePlayer';
import { CEFRLevel } from '../schema';

type MediaContextType = {
	entry: null | EntryData;
	level: null | CEFRLevel;
	setEntryAndLevel: (s: { entry: EntryData | null; level: CEFRLevel | null }) => void;
	player: ReturnType<typeof usePlayer> | null;
};

export const MediaControllerContext = createContext<MediaContextType>({
	entry: null,
	level: null,
	setEntryAndLevel: () => {},
	player: null,
});

export const MediaControllerProvider: FC<{ children: ReactNode }> = ({ children }) => {
	const [{ entry, level }, setEntryAndLevel] = useState<{ entry: EntryData | null; level: CEFRLevel | null }>({ entry: null, level: null });

	const player = usePlayer(entry, level);

	return <MediaControllerContext.Provider value={{ entry, level, setEntryAndLevel, player }}>{children}</MediaControllerContext.Provider>;
};

export const useMediaControllerContext = () => {
	return useContext(MediaControllerContext);
};
