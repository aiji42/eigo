import { useParams } from 'react-router-dom';
import { displayRelativeTime } from '../libs/utils';
import { ParagraphCard } from '../componnts/ParagraphCard';
import { useEffect } from 'react';
import { Content, getNext, getPlaying, getTotalWordsCount, isTTSed } from '../libs/content';
import { useEntry } from '../hooks/useEntry';
import { useAwakeScreen } from '../hooks/useAwakeScreen';
import { useLevel } from '../hooks/useLevel';
import { useMediaControllerContext } from '../componnts/MediaControllerContext';
import { useToggleShowExplanation } from '../hooks/useToggleShowExplanation';
import { ExplanationTooltip } from '../componnts/ExplanationTooltip';

const refreshUntil = ({ content }: { content: Content }) => !isTTSed(content);

// TODO: オリジナルページのURLをソースとして表示する
// TODO: 再生残り時間がx秒以下になったら次のページのプレイリストをプリフェッチしておく
const Page = () => {
	const { entryId = '' } = useParams<'entryId'>();
	const [level] = useLevel();
	const { entry } = useEntry({ entryId, level }, refreshUntil);

	const { setEntryAndLevel, player } = useMediaControllerContext();
	useEffect(() => {
		setEntryAndLevel({ entry, level });
	}, [setEntryAndLevel, entry, level]);

	useAwakeScreen(player?.playing);
	const [showExplanation] = useToggleShowExplanation();

	const currentTime = player?.currentTime ?? 0;
	const playing = getPlaying(entry.content, currentTime);
	const nextSentence = getNext(entry.content, currentTime, 'sentence');

	return (
		<>
			<div className="flex flex-col gap-4 p-2">
				<h1 className="text-center text-4xl font-bold">{entry.title}</h1>
				<img className="m-auto h-64 object-cover md:h-96" src={entry.thumbnailUrl ?? ''} alt={entry.title} />
				<div className="flex gap-4 text-neutral-500">
					<p>{displayRelativeTime('publishedAt' in entry ? entry.publishedAt : entry.createdAt)} ago</p>
					<p>{getTotalWordsCount(entry.content).toLocaleString()} words</p>
				</div>
			</div>
			<div className="mb-32 mt-2 flex flex-col gap-6 text-2xl">
				{entry.content.map((p, i) => (
					<div className="relative" key={i}>
						<ParagraphCard
							paragraph={p}
							scrollInActive={currentTime > 0}
							activeSentenceKey={playing.paragraph?.key === p.key ? playing.sentence?.key : undefined}
						/>
						{playing.paragraph?.key === p.key && showExplanation && (
							<>
								{playing.sentence && <ExplanationTooltip text={playing.sentence.text} show />}
								{/* 読み上げ中の次のセンテンスをプリロードしておく */}
								{nextSentence && <ExplanationTooltip text={nextSentence.text} preload />}
							</>
						)}
					</div>
				))}
			</div>
		</>
	);
};

export default Page;
