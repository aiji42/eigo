import useSWR from 'swr';
import { Entry } from '../schema';
import { displayRelativeTime, getJson } from '../libs/utils';
import { Link } from 'react-router-dom';
import { LoadingSpinnerIcon } from '../componnts/Icons';

const Page = () => {
	const { data = [], isLoading } = useSWR<Entry[]>('/api/list', getJson);

	return (
		<div className="p-2">
			<h1 className="mb-4 text-4xl font-bold">VOA News</h1>
			<ul>
				{data.map((item) => (
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
			<button className="w-full rounded-md bg-neutral-900 p-2 text-2xl hover:bg-neutral-800 active:bg-neutral-700">more</button>
			{isLoading && <LoadingSpinnerIcon />}
		</div>
	);
};

export default Page;
