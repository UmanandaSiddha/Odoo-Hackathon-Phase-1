import { createBrowserRouter } from 'react-router-dom';
import { Home } from '../pages/Home';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  // Add other routes here as needed
]); 