import { useParams } from 'react-router-dom';
import { displayRelativeTime } from '../libs/utils';
import { Player } from '../componnts/Player';
import { ParagraphCard } from '../componnts/ParagraphCard';
import { useEffect } from 'react';
import { LoadingSpinnerIcon } from '../componnts/Icons';
import { getPlaying, isTTSed } from '../libs/content';
import { useEntry } from '../hooks/useEntry';
import { useTranslate } from '../hooks/useTranslate';
import { useAwakeScreen } from '../hooks/useAwakeScreen';
import { usePlayer } from '../hooks/usePlayer';

const Page = () => {
	const { entryId } = useParams<'entryId'>();
	const { entry, isLoading } = useEntry(entryId, (entry) => !!entry && !isTTSed(entry.content));

	const { translatingKey, translated, translate, isLoading: isLoadingTranslate } = useTranslate(entry?.content);

	const player = usePlayer(entryId ?? '', entry, {
		nextId: entry?.nextEntryId,
		prevId: entry?.prevEntryId,
		stopAndRestart: !!translatingKey,
	});

	// 再生を開始したら翻訳を閉じる
	useEffect(() => {
		if (player.playing) translate(null);
	}, [player.playing]);

	useAwakeScreen(player.playing);

	if (isLoading) return <LoadingSpinnerIcon />;
	if (!entry) return null;

	const playing = getPlaying(entry.content, player.currentTime);

	return (
		<>
			<div className="flex flex-col gap-4 p-2">
				<h1 className="text-center text-4xl font-bold">{entry.title}</h1>
				<p className="text-center text-gray-500">{displayRelativeTime(entry.publishedAt)} ago</p>
				{entry.thumbnailUrl && <img className="m-auto h-64 object-cover md:h-96" src={entry.thumbnailUrl} alt={entry.title} />}
			</div>
			<div className="mb-32 mt-8 flex flex-col gap-6 text-2xl">
				{entry.content.map((p, i) => {
					const isLoading = translatingKey === p.key && isLoadingTranslate;
					return (
						<div className="relative" onClick={() => translate(p.key)} key={i}>
							{translatingKey !== p.key || isLoading ? (
								<>
									<ParagraphCard
										paragraph={p}
										scrollInActive={player.currentTime > 0}
										activeSentenceKey={playing.paragraph?.key === p.key ? playing.sentence?.key : undefined}
										showTranslation={isLoading}
									/>
									{isLoading && <LoadingSpinnerIcon />}
								</>
							) : (
								<p className="rounded-md bg-neutral-800 p-2">{translated?.translated}</p>
							)}
						</div>
					);
				})}
			</div>
			<div className="fixed bottom-0 left-0 right-0 flex items-center justify-center bg-neutral-900 pb-safe">
				<Player {...player} />
			</div>
		</>
	);
};

export default Page;
