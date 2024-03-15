import { Link, useParams, useSearchParams } from 'react-router-dom';
import { displayRelativeTime, isCEFRLevel } from '../libs/utils';
import { Player } from '../componnts/Player';
import { ParagraphCard } from '../componnts/ParagraphCard';
import { useEffect, useReducer } from 'react';
import { ArrowIcon, LoadingSpinnerIcon } from '../componnts/Icons';
import { getPlaying, getTotalWordsCount, isTTSed } from '../libs/content';
import { useEntry } from '../hooks/useEntry';
import { useTranslate } from '../hooks/useTranslate';
import { useAwakeScreen } from '../hooks/useAwakeScreen';
import { usePlayer } from '../hooks/usePlayer';
import { StickyHeader } from '../componnts/StickyHeader';
import { clsx } from 'clsx';
import { CEFRLevel } from '../schema';
import { useCalibrateEntryState } from '../hooks/useCalibrateEntryState';

// TODO: オリジナルページのURLをソースとして表示する
// TODO: 再生残り時間がx秒以下になったら次のページのプレイリストをプリフェッチしておく
const Page = () => {
	const { entryId } = useParams<'entryId'>();
	const [searchParams] = useSearchParams();
	const level = searchParams.get('level');
	const { entry } = useEntry({ entryId, level }, (entry) => !isTTSed(entry.content));
	const a1 = useCalibrateEntryState(entryId, 'A1');
	const a2 = useCalibrateEntryState(entryId, 'A2');
	const b1 = useCalibrateEntryState(entryId, 'B1');

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

	const [isOpen, toggle] = useReducer((s) => !s, false);

	return (
		<>
			<StickyHeader>
				<div className="flex items-center gap-2 overflow-hidden">
					<div className={clsx('flex gap-4 duration-200', !isOpen && 'translate-x-52')} {...(!isOpen && { inert: '' })}>
						{!!level && <CalibrateLevelButton level="Og" isCalibrated />}
						{level !== 'A1' && <CalibrateLevelButton level="A1" {...a1} onClickCalibrate={a1.calibrate} />}
						{level !== 'A2' && <CalibrateLevelButton level="A2" {...a2} onClickCalibrate={a2.calibrate} />}
						{level !== 'B1' && <CalibrateLevelButton level="B1" {...b1} onClickCalibrate={b1.calibrate} />}
					</div>
					<div className="z-10 flex items-center gap-2 bg-slate-950 text-slate-400">
						<button
							className={clsx(
								'z-10 flex size-8 items-center justify-center rounded-full duration-100 active:bg-slate-800',
								!isOpen && 'rotate-180',
							)}
							onClick={toggle}
						>
							<ArrowIcon />
						</button>
						<CalibrateLevelButton level={isCEFRLevel(level) ? level : 'Og'} isCurrent isCalibrated />
					</div>
				</div>
			</StickyHeader>
			<div className="flex flex-col gap-4 p-2">
				<h1 className="text-center text-4xl font-bold text-slate-300">{entry.title}</h1>
				{entry.thumbnailUrl && <img className="m-auto h-64 object-cover md:h-96" src={entry.thumbnailUrl} alt={entry.title} />}
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

const CalibrateLevelButton = ({
	onClickCalibrate,
	isCalibrating,
	level,
	isCalibrated,
	isCurrent,
}: {
	onClickCalibrate?: VoidFunction;
	isCalibrating?: boolean;
	level: CEFRLevel | 'Og';
	isCalibrated?: boolean;
	isCurrent?: boolean;
}) => {
	if (isCurrent)
		return (
			<span
				className={clsx(
					'block rounded-md border-2 px-1 py-0.5 font-bold text-slate-950',
					level === 'Og'
						? 'border-slate-200 bg-slate-200'
						: level === 'A1'
							? 'border-violet-400 bg-violet-400'
							: level === 'A2'
								? 'border-violet-600 bg-violet-600'
								: level === 'B1'
									? 'border-teal-400 bg-teal-400'
									: level === 'B2'
										? 'border-teal-600 bg-teal-600'
										: '',
				)}
			>
				{level}
			</span>
		);

	if (isCalibrated)
		return (
			<Link
				to={{ search: level !== 'Og' ? `level=${level}` : '' }}
				replace
				className={clsx(
					'block rounded-md border-2 px-1 py-0.5 font-bold active:bg-slate-800',
					level === 'Og'
						? 'border-slate-300 text-slate-300'
						: level === 'A1'
							? 'border-violet-400 text-violet-400'
							: level === 'A2'
								? 'border-violet-600 text-violet-600'
								: level === 'B1'
									? 'border-teal-400 text-teal-400'
									: level === 'B2'
										? 'border-teal-600 text-teal-600'
										: '',
				)}
			>
				{level}
			</Link>
		);

	return (
		<button
			type="button"
			onClick={() => {
				if (onClickCalibrate && confirm('Are you sure to calibrate this entry?')) onClickCalibrate();
			}}
			disabled={isCalibrating}
			className={clsx(
				'rounded-md border-2 border-transparent px-1 py-0.5 font-bold active:bg-slate-800',
				isCalibrating && 'animate-pulse',
				level === 'A1'
					? 'text-violet-100'
					: level === 'A2'
						? 'text-violet-100'
						: level === 'B1'
							? 'text-teal-100'
							: level === 'B2'
								? 'text-teal-100'
								: '',
			)}
			aria-label="Calibrate the difficulty of this entry. It may take a while."
		>
			{level}
		</button>
	);
};
