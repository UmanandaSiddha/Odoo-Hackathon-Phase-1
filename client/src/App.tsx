import { ThemeProvider } from './context/ThemeContext'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import './App.css'
import { useAppDispatch } from './hooks/reduxHooks'
import { useEffect } from 'react'
import { fetchCurrentUser } from './store/slice/auth.slice'

function App() {
	const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(fetchCurrentUser());
    }, [dispatch]);

	return (
		<ThemeProvider>
			<RouterProvider router={router} />
		</ThemeProvider>
	)
}

export default App
