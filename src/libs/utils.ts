import { CEFRLevel } from '../schema';

export const base64ToUint8Array = (base64: string) => {
	const raw = atob(base64);
	const uint8Array = new Uint8Array(raw.length);
	for (let i = 0; i < raw.length; i++) {
		uint8Array[i] = raw.charCodeAt(i);
	}
	return uint8Array;
};

export const sha256 = async (text: string): Promise<string> => {
	const buffer = new TextEncoder().encode(text);
	const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};

export const displayRelativeTime = (_date: Date | string) => {
	const date = typeof _date === 'string' ? new Date(_date) : _date;
	const now = new Date();
	const diff = now.getTime() - date.getTime();
	const minutes = Math.floor(diff / 60000);
	if (minutes < 60) return minutes === 1 ? '1 min' : `${minutes} mins`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return hours === 1 ? '1 hour' : `${hours} hours`;
	const days = Math.floor(hours / 24);
	return days === 1 ? '1 day' : `${days} days`;
};

export const isCEFRLevel = (level?: string | null): level is CEFRLevel => {
	if (!level) return false;
	return ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(level);
};

export function assertCEFRLevel(level?: string | null): asserts level is CEFRLevel {
	if (!isCEFRLevel(level)) {
		throw new Error(`invalid CEFR level: ${level}`);
	}
}
