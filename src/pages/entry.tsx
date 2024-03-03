import useSWR from 'swr';
import { useParams } from 'react-router-dom';
import { InferSelectModel } from 'drizzle-orm';
import { entries } from '../schema';
import { displayRelativeTime } from '../libs/utils';
import { Player } from '../componnts/Player';
import { usePlayer } from '../hooks/usePlayer';
import { ParagraphCard } from '../componnts/ParagraphCard';
import { useEffect, useReducer } from 'react';
import useSWRImmutable from 'swr/immutable';

const isPlayingSection = (offset: number | null, duration: number | null, current: number) => {
	return offset !== null && duration !== null && offset < current && offset + duration > current;
};

const Page = () => {
	const { entryId } = useParams<'entryId'>();
	const { data, isLoading } = useSWR(`/api/entry/${entryId}`, async (key) => {
		const res = await fetch(key);
		return (await res.json()) as InferSelectModel<typeof entries>;
	});

	const [playerRef, player] = usePlayer(data);

	const [translatingKey, toggleTranslate] = useReducer((currentKey: string | null, key: string | null) => {
		if (currentKey === key) return null;
		return key;
	}, null);

	const { data: translated, isLoading: isLoadingTranslate } = useSWRImmutable(translatingKey, async (key) => {
		const text = data?.content
			.find((p) => p.key === key)
			?.sentences.map((s) => s.text)
			.join(' ');
		if (!text) throw new Error('text not found');
		const res = await fetch('/api/translate', {
			method: 'POST',
			body: JSON.stringify({ text }),
			headers: { 'Content-Type': 'application/json' },
		});
		return ((await res.json()) as { translated: string }).translated;
	});

	useEffect(() => {
		if (translatingKey) player.pause();
		else player.play();
	}, [translatingKey, player.pause, player.play]);

	useEffect(() => {
		player.playing && toggleTranslate(null);
	}, [player.playing]);

	if (!data) return null;
	if (isLoading) return null;

	return (
		<>
			<div className="flex flex-col gap-4 p-2">
				<h1 className="text-center text-4xl font-bold">{data.title}</h1>
				<div className="text-gray-500">{displayRelativeTime(data.publishedAt)} ago</div>
				{data.thumbnailUrl && <img className="m-auto h-64 object-cover md:h-96" src={data.thumbnailUrl} alt={data.title} />}
			</div>
			<div className="mb-32 mt-8 flex flex-col gap-6 text-2xl">
				{data.content.map((p, i) => {
					const isLoading = translatingKey === p.key && isLoadingTranslate;
					const activeSentenceKey = p.sentences.find(({ offset, duration }) => isPlayingSection(offset, duration, player.current))?.key;
					return (
						<div className="relative" onClick={() => toggleTranslate(p.key)} key={i}>
							{translatingKey !== p.key || isLoading ? (
								<>
									<ParagraphCard paragraph={p} scrollInActive activeSentenceKey={activeSentenceKey} showTranslation={isLoading} />
									{isLoading && <LoadingSpinner />}
								</>
							) : (
								<p className="rounded-md bg-neutral-800 p-2">{translated}</p>
							)}
						</div>
					);
				})}
			</div>
			<div className="fixed bottom-0 left-0 right-0 flex items-center justify-center md:p-1">
				<Player playerRef={playerRef} {...player} />
			</div>
		</>
	);
};

const LoadingSpinner = () => {
	return (
		<div className="absolute inset-0 flex items-center justify-center">
			<svg aria-hidden="true" className="size-12 animate-spin fill-green-600 text-slate-700" viewBox="0 0 100 101" fill="none">
				<path
					d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
					fill="currentColor"
				/>
				<path
					d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
					fill="currentFill"
				/>
			</svg>
		</div>
	);
};

export default Page;
