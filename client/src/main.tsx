import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/animations.css';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './store';
import { SocketProvider } from './sockets/SocketProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<Provider store={store}>
			<SocketProvider>
				<App />
			</SocketProvider>
		</Provider>
	</React.StrictMode>,
);
