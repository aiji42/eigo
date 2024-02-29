export const sha256 = async (text: string): Promise<string> => {
	const buffer = new TextEncoder().encode(text);
	const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
};
