import { ThemeProvider } from './context/ThemeContext'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { Toaster } from 'sonner'
import './App.css'
import { fetchCurrentUser } from './store/slice/auth.slice'
import { useAppDispatch } from './hooks/reduxHooks'
import { useEffect } from 'react'

function App() {
	const dispatch = useAppDispatch();

	// This effect runs once on app load, starting the auth check.
	useEffect(() => {
		dispatch(fetchCurrentUser());
	}, [dispatch]);

	return (
		<ThemeProvider>
			<RouterProvider router={router} />
			<Toaster richColors position="top-right" />
		</ThemeProvider>
	);
}

export default App;
