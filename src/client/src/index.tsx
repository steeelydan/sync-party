import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store';

import App from './App';
import 'typeface-open-sans';
import './css/main.css';

// TODO: More info
if (!NODE_ENV || !SERVER_PORT || !WEBSOCKETS_PORT) {
    throw new Error(
        'Missing environment settings. Did you configure the .env file?'
    );
}

const rootElement = document.getElementById('root');

if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <Provider store={store}>
            <App />
        </Provider>
    );
}
