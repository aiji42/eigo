import useSWR from 'swr';
import { useParams } from 'react-router-dom';
import { InferSelectModel } from 'drizzle-orm';
import { entries } from '../schema';
import { displayRelativeTime } from '../libs/utils';
import { Player } from '../componnts/Player';
import { usePlayer } from '../hooks/usePlayer';
import { ParagraphCard } from '../componnts/ParagraphCard';
import { useEffect, useReducer, useState } from 'react';
import useSWRImmutable from 'swr/immutable';
import { LoadingSpinnerIcon } from '../componnts/Icons';
import useSWRMutation from 'swr/mutation';
import { Content } from '../libs/content';

const isPlayingSection = (offset: number | null, duration: number | null, current: number) => {
	return offset !== null && duration !== null && offset < current && offset + duration > current;
};

const Page = () => {
	const { entryId } = useParams<'entryId'>();
	const [refreshInterval, setRefreshInterval] = useState(0);
	const { data, isLoading } = useSWR(
		`/api/entry/${entryId}`,
		async (key) => {
			const res = await fetch(key);
			return (await res.json()) as InferSelectModel<typeof entries>;
		},
		{
			refreshInterval,
		},
	);
	useEffect(() => {
		if (data && !data.isTTSed) setRefreshInterval(1000);
		else setRefreshInterval(0);
	}, [data]);
	const {
		data: calibratedContent,
		trigger,
		isMutating,
	} = useSWRMutation(`/calibrate/${entryId}`, async (key) => {
		const res = await fetch(key);
		return (await res.json()) as Content;
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
				<button onClick={() => trigger()} disabled={isMutating || !!calibratedContent}>
					Calibrate
				</button>
			</div>
			<div className="mb-32 mt-8 flex flex-col gap-6 text-2xl">
				{(calibratedContent ?? data.content).map((p, i) => {
					const isLoading = translatingKey === p.key && isLoadingTranslate;
					const activeSentenceKey = p.sentences.find(({ offset, duration }) => isPlayingSection(offset, duration, player.current))?.key;
					return (
						<div className="relative" onClick={() => toggleTranslate(p.key)} key={i}>
							{translatingKey !== p.key || isLoading ? (
								<>
									<ParagraphCard paragraph={p} scrollInActive activeSentenceKey={activeSentenceKey} showTranslation={isLoading} />
									{isLoading && <LoadingSpinnerIcon />}
								</>
							) : (
								<p className="rounded-md bg-neutral-800 p-2">{translated}</p>
							)}
						</div>
					);
				})}
			</div>
			<div className="fixed bottom-0 left-0 right-0 flex items-center justify-center md:p-1">
				<Player playerRef={playerRef} {...player} loading={player.loading || !data.isTTSed} />
			</div>
		</>
	);
};

export default Page;
