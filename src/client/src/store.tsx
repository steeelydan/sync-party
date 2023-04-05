import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { combinedReducers } from './reducers';

import type { Store } from 'redux';

const initialState = {};

let store: Store;
if (NODE_ENV === 'production') {
    store = createStore(combinedReducers, initialState);
} else {
    store = createStore(combinedReducers, initialState, composeWithDevTools());
}

export { store };
