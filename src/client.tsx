import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider, ScrollRestoration } from 'react-router-dom';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

const Root = () => {
	return (
		<>
			<ScrollRestoration />
			<ErrorBoundary fallback={<div className="flex items-center justify-center pt-24 text-3xl">🙇‍ Something went wrong...</div>}>
				<Suspense
					fallback={
						<picture className="absolute inset-0 flex items-center justify-center">
							<source srcSet="https://fonts.gstatic.com/s/e/notoemoji/latest/1f30e/512.webp" type="image/webp" />
							<img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f30e/512.gif" alt="🌎" width="64" height="64" />
						</picture>
					}
				>
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
