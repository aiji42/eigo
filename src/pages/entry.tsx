import { useParams } from 'react-router-dom';
import { displayRelativeTime, getJson } from '../libs/utils';
import { Player } from '../componnts/Player';
import { usePlayer } from '../hooks/usePlayer';
import { ParagraphCard } from '../componnts/ParagraphCard';
import { useEffect } from 'react';
import { LoadingSpinnerIcon } from '../componnts/Icons';
import useSWRMutation from 'swr/mutation';
import { Content, getPlaying, isTTSed } from '../libs/content';
import { useMediaSession } from '../hooks/useMediaSession';
import { useEntry } from '../hooks/useEntry';
import { useTranslate } from '../hooks/useTranslate';

const Page = () => {
	const { entryId } = useParams<'entryId'>();
	const { entry, isLoading } = useEntry(entryId, (entry) => !!entry && !isTTSed(entry.content));

	const { data: calibratedContent, trigger, isMutating } = useSWRMutation<Content>(`/calibrate/${entryId}`, getJson);

	const { translatingKey, translated, translate, isLoading: isLoadingTranslate } = useTranslate(entry?.content);

	const [playerRef, player] = usePlayer(entry ? `/playlist/${entry.id}/voice.m3u8` : null, { playPauseSync: () => !!translatingKey });
	useMediaSession(playerRef, { title: entry?.title, lgArtwork: entry?.thumbnailUrl, smArtwork: entry?.thumbnailUrl });

	// 再生を開始したら翻訳を閉じる
	useEffect(() => {
		if (player.playing) translate(null);
	}, [player.playing]);

	if (isLoading) return <LoadingSpinnerIcon />;
	if (!entry) return null;

	const playing = getPlaying(entry.content, player.currentTime);

	return (
		<>
			<div className="flex flex-col gap-4 p-2">
				<h1 className="text-center text-4xl font-bold">{entry.title}</h1>
				<div className="text-gray-500">{displayRelativeTime(entry.publishedAt)} ago</div>
				{entry.thumbnailUrl && <img className="m-auto h-64 object-cover md:h-96" src={entry.thumbnailUrl} alt={entry.title} />}
				<button onClick={() => trigger()} disabled={isMutating || !!calibratedContent}>
					Calibrate
				</button>
			</div>
			<div className="mb-32 mt-8 flex flex-col gap-6 text-2xl">
				{(calibratedContent ?? entry.content).map((p, i) => {
					const isLoading = translatingKey === p.key && isLoadingTranslate;
					return (
						<div className="relative" onClick={() => translate(p.key)} key={i}>
							{translatingKey !== p.key || isLoading ? (
								<>
									<ParagraphCard
										paragraph={p}
										scrollInActive
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
			<div className="fixed bottom-0 left-0 right-0 flex items-center justify-center md:p-1">
				<Player playerRef={playerRef} {...player} loading={player.loading || !isTTSed(entry.content)} content={entry.content} />
			</div>
		</>
	);
};

export default Page;
