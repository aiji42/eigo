import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import List from './pages/list';
import Entry from './pages/entry';

const router = createBrowserRouter([
	{
		path: '/',
		element: <List />,
	},
	{
		path: '/:entryId',
		element: <Entry />,
	},
]);

const App = () => {
	return <RouterProvider router={router} />;
};

const domNode = document.getElementById('root')!;
const root = createRoot(domNode);
root.render(<App />);
