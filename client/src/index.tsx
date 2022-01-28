import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import store from './store';

import App from './App';
import 'typeface-open-sans';
import './assets/main.css';

// TODO: More info
if (
    !process.env.REACT_APP_NODE_ENV ||
    !process.env.REACT_APP_SERVER_URL ||
    !process.env.REACT_APP_SOCKET_URL ||
    !process.env.REACT_APP_WEBRTC_HOST ||
    !process.env.REACT_APP_WEBRTC_PORT
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
