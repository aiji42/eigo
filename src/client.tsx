import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider, ScrollRestoration } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { LoadingIcon } from './componnts/Icons';
import { StickyHeader } from './componnts/StickyHeader';

const ListPage = lazy(() => import('./pages/list'));
const EntryPage = lazy(() => import('./pages/entry'));

const Root = () => {
	return (
		<>
			<ScrollRestoration />
			<StickyHeader />
			<ErrorBoundary fallback={<div className="flex items-center justify-center pt-24 text-3xl">🙇‍ Something went wrong...</div>}>
				<Suspense fallback={<LoadingIcon />}>
					<Outlet />
				</Suspense>
			</ErrorBoundary>
		</>
	);
};

const router = createBrowserRouter([
	{
		path: '/',
		element: <Root />,
		children: [
			{
				index: true,
				element: <ListPage />,
			},
			{
				path: '/:entryId',
				element: <EntryPage />,
			},
		],
	},
]);

const App = () => {
	return <RouterProvider router={router} />;
};

const domNode = document.getElementById('root')!;
const root = createRoot(domNode);
root.render(<App />);
