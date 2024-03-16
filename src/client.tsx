import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider, ScrollRestoration } from 'react-router-dom';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { LoadingIcon } from './componnts/Icons';

const Root = () => {
	return (
		<>
			<ScrollRestoration />
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
				path: '/',
				lazy: async () => ({
					Component: (await import('./pages/list')).default,
					loader: () => null,
				}),
			},
			{
				path: '/:entryId',
				lazy: async () => ({
					Component: (await import('./pages/entry')).default,
					loader: () => null,
				}),
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
