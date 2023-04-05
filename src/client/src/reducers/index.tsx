import { combineReducers } from 'redux';
import { globalReducer } from './globalReducer';

export const combinedReducers = combineReducers({
    globalState: globalReducer
});
