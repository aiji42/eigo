import { useLocalStorage } from '@rehooks/local-storage';
import { CEFRLevel } from '../schema';

export const useLevel = () => {
	return useLocalStorage<CEFRLevel>('level');
};
