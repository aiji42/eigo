import useSWR from 'swr';
import { useParams } from 'react-router-dom';
import { InferSelectModel } from 'drizzle-orm';
import { entries } from '../schema';
import { displayRelativeTime } from '../libs/utils';
import { clsx } from 'clsx';
import { Player } from '../componnts/Player';
import { usePlayer } from '../hooks/usePlayer';
import { FC, useEffect, useRef, useState } from 'react';

const isPlayingSection = (offset: number | null, duration: number | null, current: number) => {
	return offset !== null && duration !== null && offset < current && offset + duration > current;
};

const Page = () => {
	const { entryId } = useParams<'entryId'>();
	const { data, isLoading } = useSWR(`/api/entry/${entryId}`, async (key) => {
		const res = await fetch(key);
		return (await res.json()) as InferSelectModel<typeof entries>;
	});

	const [playerRef, player] = usePlayer(`/playlist/${entryId}/voice.m3u8`);

	if (!data) return null;
	if (isLoading) return null;

	return (
		<>
			<h1 className="mb-4 text-4xl font-bold">{data.title}</h1>
			<div className="mb-4 text-gray-400">{displayRelativeTime(data.publishedAt)} ago</div>
			{data.thumbnailUrl && <img className="m-auto h-64 object-cover md:h-96" src={data.thumbnailUrl} alt={data.title} />}
			<div className="nar mb-16 mt-8 text-2xl">
				{data.content.map((p, i) => (
					<p key={i} className={clsx('rounded-md p-2', isPlayingSection(p.offset, p.duration, player.current) && 'bg-neutral-800')}>
						{p.sentences.map((s, i) => (
							<span key={i} className={clsx(isPlayingSection(s.offset, s.duration, player.current) && 'bg-orange-600')}>
								{s.text}
							</span>
						))}
					</p>
				))}
			</div>
			<div className="fixed bottom-0 left-0 right-0 flex items-center justify-center bg-neutral-900 bg-opacity-50 p-4">
				<Player playerRef={playerRef} {...player} />
			</div>
		</>
	);
};

export default Page;

const useFontSize = () => {
	const [rate, setRate] = useState(() => (localStorage.getItem('fontSize') ? parseInt(localStorage.getItem('fontSize')!) : 100));

	useEffect(() => {
		localStorage.setItem('fontSize', rate.toString());
	}, [rate]);

	const decrease = () => setRate((current) => Math.max(50, current - 10));
	const increase = () => setRate((current) => current + 10);

	return { rate, decrease, increase };
};

const FontSizeController: FC<{ rate: number; decrease: VoidFunction; increase: VoidFunction }> = ({ rate, decrease, increase }) => {
	return (
		<div className="flex items-center justify-center gap-4 p-4 text-white">
			<button onClick={decrease} className="rounded-md bg-neutral-800 px-4 py-2 active:bg-neutral-700">
				-
			</button>
			<div>{rate}%</div>
			<button onClick={increase} className="rounded-md bg-neutral-800 px-4 py-2 active:bg-neutral-700">
				+
			</button>
		</div>
	);
};
