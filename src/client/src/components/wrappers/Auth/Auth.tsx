import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setGlobalState } from '../../../actions/globalActions';
import Axios from 'axios';
import { axiosConfig } from '../../../common/helpers';
import { useTranslation } from 'react-i18next';

import { Spinner } from '../../display/Spinner/Spinner';
import { ScreenLogin } from '../../screens/ScreenLogin/ScreenLogin';

import type { RootAppState } from '../../../../../shared/types';

type Props = {
    children: JSX.Element;
};

export const Auth = (props: Props): JSX.Element => {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const loggedIn = useSelector(
        (state: RootAppState) => state.globalState.loggedIn
    );

    useEffect(() => {
        const auth = async (): Promise<void> => {
            try {
                const response = await Axios.post(
                    '/api/auth',
                    {},
                    axiosConfig()
                );
                if (response.data.success) {
                    dispatch(
                        setGlobalState({
                            loggedIn: true,
                            user: response.data.user
                        })
                    );
                } else {
                    dispatch(
                        setGlobalState({
                            loggedIn: false
                        })
                    );
                }
            } catch (error) {
                dispatch(
                    setGlobalState({
                        loggedIn: false
                    })
                );
            }
        };
        auth();
    }, [dispatch, t]);

    return loggedIn === true ? (
        props.children
    ) : loggedIn === false ? (
        <div className="absolute top-0 left-0 w-full h-full flex">
            <ScreenLogin></ScreenLogin>
        </div>
    ) : (
        <div className="absolute top-0 left-0 w-full h-full flex">
            <Spinner></Spinner>
        </div>
    );
};
