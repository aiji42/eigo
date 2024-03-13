import { Link, useParams, useSearchParams } from 'react-router-dom';
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
import { StickyHeader } from '../componnts/StickyHeader';
import { clsx } from 'clsx';

// TODO: オリジナルページのURLをソースとして表示する
// TODO: 再生残り時間がx秒以下になったら次のページのプレイリストをプリフェッチしておく
const Page = () => {
	const { entryId } = useParams<'entryId'>();
	const [searchParams] = useSearchParams();
	const level = searchParams.get('level');
	const { entry, nextEntryId, prevEntryId, hasCalibratedEntry, isCalibrating, calibrate } = useEntry(
		{ entryId, level },
		(entry) => !!entry && !isTTSed(entry.content),
	);

	const { translatingKey, translated, translate, isLoading: isLoadingTranslate } = useTranslate(entry?.content);

	const player = usePlayer(level ? `/${entryId}/${level}/playlist.m3u8` : `/${entryId}/playlist.m3u8`, entry, {
		nextId: nextEntryId,
		prevId: prevEntryId,
		stopAndRestart: !!translatingKey,
	});

	// 再生を開始したら翻訳を閉じる
	useEffect(() => {
		if (player.playing) translate(null);
	}, [player.playing]);

	useAwakeScreen(player.playing);

	const playing = getPlaying(entry.content, player.currentTime);

	return (
		<>
			<StickyHeader>
				{level ? (
					<Link
						to={{ pathname: `/${entryId}` }}
						replace
						className="rounded-md border-2 border-purple-700 px-1 py-0.5 font-bold text-purple-700"
					>
						{level}
					</Link>
				) : hasCalibratedEntry ? (
					<Link
						to={{ pathname: `/${entryId}`, search: `level=A1` }}
						replace
						className="rounded-md border-2 border-purple-300 px-1 py-0.5 font-bold text-purple-300"
					>
						A1
					</Link>
				) : (
					<button
						onClick={() => calibrate()}
						disabled={isCalibrating}
						className={clsx(
							'rounded-md border-2 border-slate-400 px-1 py-0.5 font-bold text-slate-400',
							isCalibrating && 'animate-pulse border-slate-300 text-slate-300',
						)}
						aria-label="Calibrate the difficulty of this entry. It may take a while."
					>
						A1
					</button>
				)}
			</StickyHeader>
			<div className="flex flex-col gap-4 p-2">
				<h1 className="text-center text-4xl font-bold text-slate-300">{entry.title}</h1>
				<p className="text-center text-gray-500">{displayRelativeTime('publishedAt' in entry ? entry.publishedAt : entry.createdAt)} ago</p>
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
