import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setGlobalState } from '../../../actions/globalActions';
import Axios from 'axios';
import { axiosConfig } from '../../../common/helpers';
import { useTranslation } from 'react-i18next';
import Button from '../../input/Button/Button';
import Alert from '../../display/Alert/Alert';

export default function ScreenLogin(): JSX.Element {
    const [displayState, setDisplayState] = useState<'username' | 'password'>(
        'username'
    );
    const [alert, setAlert] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useDispatch();
    const { t } = useTranslation();

    const handleToPasswordForm = (): void => {
        if (username !== '') {
            setDisplayState('password');
        }
    };

    const handleBackToUsername = (): void => {
        setDisplayState('username');
    };

    const handlePasswordSubmit = async (): Promise<void> => {
        if (username !== '' && password !== '') {
            try {
                const response = await Axios.post(
                    process.env.REACT_APP_API_ROUTE + 'login',
                    {
                        username: username,
                        password: password
                    },
                    axiosConfig()
                );

                if (response.data.success === true) {
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

                    setAlert(t(`apiResponseMessages.${response.data.msg}`));
                }
            } catch (error) {
                dispatch(
                    setGlobalState({
                        loggedIn: false
                    })
                );

                setAlert(t('apiResponseMessages.wrongUsernameOrPassword'));
            }
        }
    };

    return (
        <div className="m-auto">
            <div className="mx-auto">
                <img
                    src={process.env.PUBLIC_URL + '/logo.png'}
                    alt="Logo"
                ></img>
            </div>
            <div className="w-64 mx-auto flex flex-col text-center">
                <form spellCheck={false}>
                    {alert && (
                        <Alert
                            mode="error"
                            text={alert}
                            className="mb-3"
                        ></Alert>
                    )}
                    <div className="mb-2">
                        {displayState === 'username' && (
                            <label htmlFor="username" className="text-lg">
                                {t('common.username')}
                            </label>
                        )}
                        {displayState === 'password' && (
                            <label htmlFor="password" className="text-lg">
                                {t('common.password')}
                            </label>
                        )}
                    </div>
                    {displayState === 'username' && (
                        <>
                            <div className="flex-row">
                                <input
                                    id="username"
                                    onKeyDown={(event): void => {
                                        if (event.key === 'Enter') {
                                            event.preventDefault();
                                            if (username !== '') {
                                                setDisplayState('password');
                                            } else {
                                                setAlert(
                                                    t(
                                                        'validation.usernameMissing'
                                                    )
                                                );
                                            }
                                        }
                                    }}
                                    className="bg-white text-gray-800 focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-2 block w-full appearance-none"
                                    type="text"
                                    autoFocus
                                    onChange={(event): void => {
                                        setAlert('');
                                        setUsername(event.target.value.trim());
                                    }}
                                    value={username}
                                ></input>
                            </div>
                            <div className="flex-row mt-4">
                                <Button
                                    onClick={(event): void => {
                                        event.preventDefault();
                                        if (username !== '') {
                                            handleToPasswordForm();
                                        } else {
                                            setAlert(
                                                t('validation.usernameMissing')
                                            );
                                        }
                                    }}
                                    text={t('common.next')}
                                ></Button>
                            </div>
                        </>
                    )}
                    {displayState === 'password' && (
                        <>
                            <div className="flex-row">
                                <input
                                    id="password"
                                    className="bg-white text-gray-800 focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-2 block w-full appearance-none"
                                    type="password"
                                    autoFocus
                                    onChange={(event): void => {
                                        setAlert('');
                                        setPassword(event.target.value.trim());
                                    }}
                                    value={password}
                                ></input>
                            </div>
                            <div className="flex-row flex mt-4">
                                <Button
                                    onClick={(event): void => {
                                        event.preventDefault();
                                        handleBackToUsername();
                                    }}
                                    text={t('common.back')}
                                ></Button>
                                <Button
                                    className="ml-auto text-green-500 w-40"
                                    color="text-green-500 border-green-500 hover:text-green-400 hover:border-green-400"
                                    type="submit"
                                    onClick={(event): void => {
                                        event.preventDefault();
                                        if (password !== '') {
                                            handlePasswordSubmit();
                                        } else {
                                            setAlert(
                                                t('validation.passwordMissing')
                                            );
                                        }
                                    }}
                                    text={t('common.submit')}
                                ></Button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}
