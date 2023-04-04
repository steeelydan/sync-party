import { SET_GLOBAL_STATE } from './actionTypes';

import type {
    AppAction,
    GlobalStateActionProperties
} from '../../../shared/types';

export const setGlobalState = (
    globalStateProperties: GlobalStateActionProperties
): AppAction => {
    return {
        type: SET_GLOBAL_STATE,
        globalStateProperties
    };
};
