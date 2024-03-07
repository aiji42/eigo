import useSWRInfinite from 'swr/infinite';
import { Entry } from '../schema';
import { displayRelativeTime, getJson } from '../libs/utils';
import { Link } from 'react-router-dom';
import { LoadingSpinnerIcon } from '../componnts/Icons';

const SIZE = 10;

const getKey = (page: number, previousPageData: Entry[][]) => {
	if (previousPageData && !previousPageData.length) return null;
	return `/api/list?offset=${page * SIZE}&size=${SIZE}`;
};

const Page = () => {
	const { data, setSize, isValidating } = useSWRInfinite(getKey, getJson<Entry[]>, {
		revalidateOnReconnect: false,
		revalidateIfStale: false,
		revalidateOnFocus: false,
		revalidateFirstPage: false,
		suspense: true,
	});

	const hasMore = (data?.at(-1)?.length ?? 0) >= SIZE;

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
			{hasMore && (
				<button
					onClick={() => setSize((current) => current + 1)}
					className="w-full rounded-md bg-neutral-900 p-2 text-2xl active:bg-neutral-700"
					disabled={isValidating}
				>
					more
				</button>
			)}
			{isValidating && (
				<div className="fixed inset-0 flex items-center justify-center">
					<LoadingSpinnerIcon />
				</div>
			)}
		</div>
	);
};

export default Page;
