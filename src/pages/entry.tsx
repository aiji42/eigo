import { useParams } from 'react-router-dom';
import { displayRelativeTime } from '../libs/utils';
import { Player } from '../componnts/Player';
import { usePlayer } from '../hooks/usePlayer';
import { ParagraphCard } from '../componnts/ParagraphCard';
import { useCallback, useEffect } from 'react';
import { LoadingSpinnerIcon } from '../componnts/Icons';
import { getNextPlaybackTime, getPlaying, getPrevPlaybackTime, isTTSed } from '../libs/content';
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

	const { translatingKey, translated, translate, isLoading: isLoadingTranslate } = useTranslate(entry?.content);

	const [playerRef, player] = usePlayer(`/playlist/${entryId}/voice.m3u8`, {
		playPauseSync: () => !!translatingKey,
		// TODO: autoPlayはローカルストレージで管理。そもそも、再生開始自体をusePlayerの外で制御したほうが良さそう
		// これはもう少し検証が必要だが、iOSではautoPlayで再生を開始すると、インタラクションするまでMediaSessionが有効にならない
		// なので、autoPlayは再生を開始したらtrueに(トラック移動での自動再生のため)とした方が良いも。
		autoPlay: true,
	});
	useMediaSession(
		playerRef,
		{ title: entry?.title, lgArtwork: entry?.thumbnailUrl, smArtwork: entry?.thumbnailUrl },
		{ onNextTrack: nextTrack, onPrevTrack: prevTrack },
	);

	// 再生を開始したら翻訳を閉じる
	useEffect(() => {
		if (player.playing) translate(null);
	}, [player.playing]);

	// TODO: iosだと意図的にアクションを起こさせないと、次のトラックに遷移しない
	// なので、ページ遷移させるためのボタン等を出現させる等に留めると良さそう
	useEffect(() => {
		if (!player.ended) return;
		const timer = setTimeout(() => nextTrack(), 1000);
		return () => clearTimeout(timer);
	}, [player.ended, nextTrack]);

	// TODO: usePlayerを原始的なuseAudioとし、Player用のpropsを作るためのusePlayerを作ってあげる(useAudioをusePlayerの中でコール)
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
			<div className="pb-safe fixed bottom-0 left-0 right-0 flex items-center justify-center bg-neutral-900">
				{/* TODO: player.loadingがfalseになるタイミングと、!isTTSed(entry.content)がfalseになるタイミングがずれるので */}
				{/* 一瞬、ローディング中に再生が始まっているように見える。=> 再生開始をusePlayerの外で制御したほうが良さそう */}
				<Player {...player} loading={player.loading || !isTTSed(entry.content)} backToPrev={backToPrev} skipToNext={skipToNext} />
			</div>
		</>
	);
};

export default Page;
