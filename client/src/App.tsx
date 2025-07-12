import { ThemeProvider } from './context/ThemeContext'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App
