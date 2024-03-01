import useSWR from 'swr';
import { useParams } from 'react-router-dom';
import { InferSelectModel } from 'drizzle-orm';
import { entries } from '../schema';
import { displayRelativeTime } from '../libs/utils';
import { Player } from '../componnts/Player';
import { usePlayer } from '../hooks/usePlayer';
import { ParagraphCard } from '../componnts/ParagraphCard';

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

	if (!data) return null;
	if (isLoading) return null;

	return (
		<>
			<h1 className="mb-4 text-4xl font-bold">{data.title}</h1>
			<div className="mb-4 text-gray-400">{displayRelativeTime(data.publishedAt)} ago</div>
			{data.thumbnailUrl && <img className="m-auto h-64 object-cover md:h-96" src={data.thumbnailUrl} alt={data.title} />}
			<div className="mb-32 mt-8 flex flex-col gap-6 text-2xl">
				{data.content.map((p, i) => (
					<ParagraphCard
						paragraph={p}
						scrollInActive
						activeSentenceKey={p.sentences.find(({ offset, duration }) => isPlayingSection(offset, duration, player.current))?.key}
						key={i}
					/>
				))}
			</div>
			<div className="fixed bottom-0 left-0 right-0 flex items-center justify-center md:p-1">
				<Player playerRef={playerRef} {...player} />
			</div>
		</>
	);
};

export default Page;
