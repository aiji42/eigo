import { useParams, useSearchParams } from 'react-router-dom';
import { displayRelativeTime } from '../libs/utils';
import { Player } from '../componnts/Player';
import { ParagraphCard } from '../componnts/ParagraphCard';
import { useEffect } from 'react';
import { LoadingIcon } from '../componnts/Icons';
import { getPlaying, getTotalWordsCount, isTTSed } from '../libs/content';
import { useEntry } from '../hooks/useEntry';
import { useTranslate } from '../hooks/useTranslate';
import { useAwakeScreen } from '../hooks/useAwakeScreen';
import { usePlayer } from '../hooks/usePlayer';
import { StickyHeader } from '../componnts/StickyHeader';
import { imageUrlByEntry } from '../libs/image';

// TODO: オリジナルページのURLをソースとして表示する
// TODO: 再生残り時間がx秒以下になったら次のページのプレイリストをプリフェッチしておく
const Page = () => {
	const { entryId } = useParams<'entryId'>();
	const [searchParams] = useSearchParams();
	const level = searchParams.get('level');
	const { entry } = useEntry({ entryId, level }, (entry) => !isTTSed(entry.content));

	const { translatingKey, translated, translate, isLoading: isLoadingTranslate } = useTranslate(entry?.content);

	const player = usePlayer(level ? `/${entryId}/${level}/playlist.m3u8` : `/${entryId}/playlist.m3u8`, entry, {
		nextId: entry.nextEntryId,
		prevId: entry.prevEntryId,
		// FIXME: 翻訳状態でリストページに戻るとバックグラウンドで再生が始まり、壊れる
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
			<StickyHeader />
			<div className="flex flex-col gap-4 p-2">
				<h1 className="text-center text-4xl font-bold text-slate-300">{entry.title}</h1>
				<img className="m-auto h-64 object-cover md:h-96" src={imageUrlByEntry(entry) ?? ''} alt={entry.title} />
				<div className="flex gap-4 text-gray-500">
					<p>{displayRelativeTime('publishedAt' in entry ? entry.publishedAt : entry.createdAt)} ago</p>
					<p>{getTotalWordsCount(entry.content).toLocaleString()} words</p>
				</div>
			</div>
			<div className="mb-32 mt-2 flex flex-col gap-6 text-2xl">
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
									{isLoading && <LoadingIcon size={32} />}
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
