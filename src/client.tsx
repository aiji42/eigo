import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Outlet, RouterProvider, ScrollRestoration } from 'react-router-dom';
import List from './pages/list';
import Entry from './pages/entry';

const Root = () => {
	return (
		<>
			<ScrollRestoration />
			<Outlet />
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
				element: <List />,
			},
			{
				path: '/:entryId',
				element: <Entry />,
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
