export const putAudio = async (store: KVNamespace, entryId: string | number, sentenceKey: string, audio: Uint8Array) =>
	store.put(`/${entryId}/${sentenceKey}/voice.mp3`, audio);

export const getAudio = async (store: KVNamespace, entryId: string | number, sentenceKey: string) =>
	store.get(`/${entryId}/${sentenceKey}/voice.mp3`, 'arrayBuffer');
