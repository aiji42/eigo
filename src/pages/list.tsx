import useSWRInfinite from 'swr/infinite';
import { Entry } from '../schema';
import { displayRelativeTime, getJson } from '../libs/utils';
import { Link } from 'react-router-dom';
import { LoadingIcon } from '../componnts/Icons';
import { useInView } from 'react-intersection-observer';
import { StickyHeader } from '../componnts/StickyHeader';

const SIZE = 10;

const getKey = (page: number, previousPageData: Entry[][]) => {
	if (previousPageData && !previousPageData.length) return null;
	return `/api/list?offset=${page * SIZE}&size=${SIZE}`;
};

const Page = () => {
	const { data, setSize, size, isValidating } = useSWRInfinite(getKey, getJson<Entry[]>, {
		suspense: true,
	});

	const { ref, inView: isScrollEnd } = useInView();

	const hasMore = (data?.at(-1)?.length ?? 0) >= SIZE;

	if (isScrollEnd && !isValidating && hasMore) {
		setSize(size + 1);
	}

	// TODO: wordsカウントと、calibratesの有無を表示する
	return (
		<div className="flex flex-col gap-4">
			<ul className="p-2">
				{data
					?.flatMap((data) => data)
					.map((item) => (
						<li key={item.id}>
							<Link to={`/${item.id}`}>
								<div className="mb-4 flex items-center justify-between gap-4 rounded-md hover:bg-neutral-800">
									<img src={item.thumbnailUrl ?? ''} alt={item.title} className="size-32 rounded-md object-cover" />
									<div className="min-w-0 flex-1">
										<h2 className="overflow-hidden overflow-ellipsis text-xl md:text-3xl">{item.title}</h2>
										<p className="font-sans text-gray-400">{displayRelativeTime(item.publishedAt)} ago</p>
									</div>
								</div>
							</Link>
						</li>
					))}
			</ul>
			{!isValidating && <div ref={ref} aria-hidden="true" />}
			{isValidating && (
				<div className="relative mb-12">
					<LoadingIcon size={32} />
				</div>
			)}
		</div>
	);
};

export default Page;
