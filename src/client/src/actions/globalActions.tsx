import { AppAction, GlobalStateActionProperties } from '../../../shared/types';
import { SET_GLOBAL_STATE } from './actionTypes';

export const setGlobalState = (
    globalStateProperties: GlobalStateActionProperties
): AppAction => {
    return {
        type: SET_GLOBAL_STATE,
        globalStateProperties
    };
};
