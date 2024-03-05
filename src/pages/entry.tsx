import { useParams } from 'react-router-dom';
import { displayRelativeTime, getJson } from '../libs/utils';
import { Player } from '../componnts/Player';
import { usePlayer } from '../hooks/usePlayer';
import { ParagraphCard } from '../componnts/ParagraphCard';
import { useCallback, useEffect } from 'react';
import { LoadingSpinnerIcon } from '../componnts/Icons';
import useSWRMutation from 'swr/mutation';
import { Content, getNextPlaybackTime, getPlaying, getPrevPlaybackTime, isTTSed } from '../libs/content';
import { useMediaSession } from '../hooks/useMediaSession';
import { useEntry } from '../hooks/useEntry';
import { useTranslate } from '../hooks/useTranslate';
import { useNavigate } from 'react-router-dom';

const Page = () => {
	const { entryId } = useParams<'entryId'>();
	const { entry, isLoading } = useEntry(entryId, (entry) => !!entry && !isTTSed(entry.content));
	const navigate = useNavigate();
	const nextTrack = useCallback(() => {
		if (entry?.nextEntryId) navigate(`/${entry.nextEntryId}`, { replace: true });
		else navigate(`/`);
	}, [navigate, entry?.nextEntryId]);
	const prevTrack = useCallback(() => {
		if (entry?.prevEntryId) navigate(`/${entry.prevEntryId}`, { replace: true });
		else navigate(`/`);
	}, [navigate, entry?.prevEntryId]);

	const { data: calibratedContent, trigger, isMutating } = useSWRMutation<Content>(`/calibrate/${entryId}`, getJson);

	const { translatingKey, translated, translate, isLoading: isLoadingTranslate } = useTranslate(entry?.content);

	const [playerRef, player] = usePlayer(`/playlist/${entryId}/voice.m3u8`, {
		playPauseSync: () => !!translatingKey,
		autoPlay: true,
	});
	useMediaSession(
		playerRef,
		{ title: entry?.title, lgArtwork: entry?.thumbnailUrl, smArtwork: entry?.thumbnailUrl },
		{ onNextTrack: nextTrack },
	);

	// 再生を開始したら翻訳を閉じる
	useEffect(() => {
		if (player.playing) translate(null);
	}, [player.playing]);

	useEffect(() => {
		if (!player.ended) return;
		const timer = setTimeout(() => nextTrack(), 1000);
		return () => clearTimeout(timer);
	}, [player.ended, nextTrack]);

	const backToPrev = useCallback(() => {
		if (!entry) return;
		const time = getPrevPlaybackTime(entry.content, player.getCurrentTime());
		if (time < 0) return prevTrack();
		else player.seek(time + 0.01);
	}, [entry, player.seek, player.getCurrentTime, prevTrack]);

	const skipToNext = useCallback(() => {
		if (!entry) return;
		const time = getNextPlaybackTime(entry.content, player.getCurrentTime());
		if (time < 0) nextTrack();
		else player.seek(time + 0.01);
	}, [entry, player.seek, player.getCurrentTime, nextTrack]);

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
				<Player {...player} loading={player.loading || !isTTSed(entry.content)} backToPrev={backToPrev} skipToNext={skipToNext} />
			</div>
		</>
	);
};

export default Page;
