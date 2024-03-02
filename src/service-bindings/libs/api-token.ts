import GoogleAuth, { GoogleKey } from 'cloudflare-workers-and-google-oauth';

export const getGoogleToken = async (key: GoogleKey) => {
	const scopes: string[] = ['https://www.googleapis.com/auth/cloud-platform'];
	const oauth = new GoogleAuth(key, scopes);
	const token = await oauth.getGoogleAuthToken();
	if (!token) throw new Error('Failed to get token');

	return token;
};
