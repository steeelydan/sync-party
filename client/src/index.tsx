import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './store';

import App from './App';
import './assets/main.css';

if (
    !process.env.REACT_APP_NODE_ENV ||
    !process.env.REACT_APP_API_ROUTE ||
    !process.env.REACT_APP_SOCKET_ROUTE
) {
    throw new Error(
        'Missing environment settings. Did you configure the .env file?'
    );
}

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
