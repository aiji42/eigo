import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider, ScrollRestoration } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { LoadingIcon } from './componnts/Icons';
import { StickyHeader } from './componnts/StickyHeader';
import { MediaControllerProvider } from './componnts/MediaControllerContext';
import { StickyMediaController } from './componnts/StickyMediaController';

const ListPage = lazy(() => import('./pages/list'));
const EntryPage = lazy(() => import('./pages/entry'));

const Root = () => {
	return (
		<>
			<ScrollRestoration />
			<ErrorBoundary
				fallback={
					<div>
						<StickyHeader onlyLogo />
						<div className="flex items-center justify-center pt-24 text-3xl">🙇‍ Something went wrong...</div>
					</div>
				}
			>
				<MediaControllerProvider>
					<StickyHeader />
					<Suspense fallback={<LoadingIcon />}>
						<Outlet />
						<StickyMediaController />
					</Suspense>
				</MediaControllerProvider>
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
