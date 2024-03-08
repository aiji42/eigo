import useSWRInfinite from 'swr/infinite';
import { Entry } from '../schema';
import { displayRelativeTime, getJson } from '../libs/utils';
import { Link } from 'react-router-dom';
import { LoadingSpinnerIcon } from '../componnts/Icons';
import { useInView } from 'react-intersection-observer';

const SIZE = 10;

const getKey = (page: number, previousPageData: Entry[][]) => {
	if (previousPageData && !previousPageData.length) return null;
	return `/api/list?offset=${page * SIZE}&size=${SIZE}`;
};

const Page = () => {
	const { data, setSize, size, isValidating } = useSWRInfinite(getKey, getJson<Entry[]>, {
		revalidateOnReconnect: false,
		revalidateIfStale: false,
		revalidateOnFocus: false,
		revalidateFirstPage: false,
		suspense: true,
	});

	const { ref, inView: isScrollEnd } = useInView();

	const hasMore = (data?.at(-1)?.length ?? 0) >= SIZE;

	if (isScrollEnd && !isValidating && hasMore) {
		setSize(size + 1);
	}

	return (
		<div className="p-2">
			<h1 className="mb-4 text-4xl font-bold">Eigo</h1>
			<ul>
				{data
					?.flatMap((data) => data)
					.map((item) => (
						<li key={item.id}>
							<Link to={`/${item.id}`}>
								<div className="mb-4 flex items-center justify-between gap-4 rounded-md hover:bg-neutral-800">
									<img src={item.thumbnailUrl ?? ''} alt={item.title} className="size-32 rounded-md object-cover" />
									<div className="min-w-0 flex-1">
										<h2 className="overflow-hidden overflow-ellipsis text-xl md:text-3xl">{item.title}</h2>
										<p className="text-gray-400">{displayRelativeTime(item.publishedAt)} ago</p>
									</div>
								</div>
							</Link>
						</li>
					))}
			</ul>
			{!isValidating && <div ref={ref} aria-hidden="true" />}
			{isValidating && (
				<div className="fixed inset-0 flex items-center justify-center">
					<LoadingSpinnerIcon />
				</div>
			)}
		</div>
	);
};

export default Page;
