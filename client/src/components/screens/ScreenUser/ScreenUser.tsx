import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { setGlobalState } from '../../../actions/globalActions';
import Axios from 'axios';
import { baseState, axiosConfig } from '../../../common/helpers';

import ButtonLink from '../../input/ButtonLink/ButtonLink';
import Heading from '../../display/Heading/Heading';
import ButtonIcon from '../../input/ButtonIcon/ButtonIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

export default function ScreenUser(): JSX.Element | null {
    const [loggedOut, setLoggedOut] = useState(false);
    const [redirect, setRedirect] = useState(false);

    const dispatch = useDispatch();
    const { t } = useTranslation();
    const user = useSelector((state: RootAppState) => state.globalState.user);

    const handleLogoutButton = async (): Promise<void> => {
        try {
            const response = await Axios.post(
                process.env.REACT_APP_SERVER_URL + '/api/logout',
                {},
                axiosConfig()
            );

            if (response.data.success === true) {
                setLoggedOut(true);

                dispatch(setGlobalState(baseState));
            } else {
                dispatch(
                    setGlobalState({
                        errorMessage: t(
                            `apiResponseMessages.${response.data.msg}`
                        )
                    })
                );
            }
        } catch (error) {
            dispatch(
                setGlobalState({
                    errorMessage: t(`errors.logoutError`)
                })
            );
        }
    };

    if (loggedOut || redirect) {
        return <Navigate to="/"></Navigate>;
    }

    return user ? (
        <div className="container">
            <div className="flex flex-row justify-between">
                <Heading
                    text={`${t('common.user')}: ${user.username}`}
                    size={2}
                    className="mb-5"
                ></Heading>
                <ButtonIcon
                    onClick={(): void => setRedirect(true)}
                    icon={
                        <FontAwesomeIcon
                            icon={faTimes}
                            size="lg"
                        ></FontAwesomeIcon>
                    }
                    className="p-1"
                    color="text-gray-200"
                    title={t('common.close')}
                ></ButtonIcon>
            </div>

            <ButtonLink
                onClick={handleLogoutButton}
                text={t('common.logout')}
                className="text-red-600 hover:text-red-500"
                padding="pr-1"
            ></ButtonLink>
        </div>
    ) : null;
}
