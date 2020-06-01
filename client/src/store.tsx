import { createStore, Store } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import rootReducer from './reducers';

const initialState = {};

let store: Store;
if (process.env.REACT_APP_NODE_ENV === 'production') {
    store = createStore(rootReducer, initialState);
} else {
    store = createStore(rootReducer, initialState, composeWithDevTools());
}

export default store;
