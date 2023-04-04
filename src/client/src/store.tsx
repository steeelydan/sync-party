import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from './reducers';

import type { Store } from 'redux';

const initialState = {};

let store: Store;
if (NODE_ENV === 'production') {
    store = createStore(rootReducer, initialState);
} else {
    store = createStore(rootReducer, initialState, composeWithDevTools());
}

export default store;
