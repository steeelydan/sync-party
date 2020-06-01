import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setGlobalState } from '../../../actions/globalActions';
import Axios from 'axios';
import { axiosConfig } from '../../../common/helpers';
import { useTranslation } from 'react-i18next';
import { RootAppState } from '../../../types';

import Spinner from '../../display/Spinner/Spinner';
import ScreenLogin from '../../screens/ScreenLogin/ScreenLogin';

type Props = {
    children: JSX.Element;
};

export default function Auth(props: Props): JSX.Element {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const loggedIn = useSelector(
        (state: RootAppState) => state.globalState.loggedIn
    );

    useEffect(() => {
        const auth = async (): Promise<void> => {
            try {
                const response = await Axios.post(
                    process.env.REACT_APP_API_ROUTE + 'auth',
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
        <ScreenLogin></ScreenLogin>
    ) : (
        <div className="w-full h-full flex">
            <Spinner></Spinner>
        </div>
    );
}
