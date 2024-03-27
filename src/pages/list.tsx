import { displayRelativeTime } from '../libs/utils';
import { Link } from 'react-router-dom';
import { LoadingIcon } from '../componnts/Icons';
import { useInView } from 'react-intersection-observer';
import { useEntriesPagination } from '../hooks/useEntriesPagination';
import { useEffect } from 'react';

const Page = () => {
	const { data, isValidating, next } = useEntriesPagination(6);

	const { ref, inView: isScrollEnd } = useInView();

	useEffect(() => {
		if (isScrollEnd) next();
	}, [isScrollEnd, next]);

	// TODO: wordsカウントと、calibratesの有無を表示する
	return (
		<div className="flex flex-col gap-4">
			<ul className="p-2">
				{data
					?.flatMap((data) => data)
					.map((item) => (
						<li key={item.id}>
							<Link to={`/${item.id}`}>
								<div className="actove:bg-neutral-200 mb-4 flex items-center justify-between gap-4 rounded-md">
									<img src={item.thumbnailUrl ?? ''} alt={item.title} className="size-32 rounded-md object-cover" />
									<div className="min-w-0 flex-1">
										<h2 className="overflow-hidden overflow-ellipsis text-xl md:text-2xl">{item.title}</h2>
										<p className="text-neutral-500">{displayRelativeTime(item.publishedAt)} ago</p>
									</div>
								</div>
							</Link>
						</li>
					))}
			</ul>
			{!isValidating && <div ref={ref} aria-hidden="true" />}
			{isValidating && (
				<div className="relative mb-32">
					<LoadingIcon size={32} />
				</div>
			)}
		</div>
	);
};

export default Page;
