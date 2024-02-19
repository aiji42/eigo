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
