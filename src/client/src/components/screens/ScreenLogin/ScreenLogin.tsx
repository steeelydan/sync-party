import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setGlobalState } from '../../../actions/globalActions';
import Axios from 'axios';
import { axiosConfig } from '../../../common/helpers';
import { useTranslation } from 'react-i18next';

import InputText from '../../input/InputText/InputText';
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

    const handleUsernameChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ): void => {
        setAlert('');
        setUsername(event.target.value.trim());
    };

    const handleUsernameEnter = (event: React.KeyboardEvent): void => {
        if (event.key === 'Enter') {
            event.preventDefault();
            if (username !== '') {
                setDisplayState('password');
            } else {
                setAlert(t('validation.usernameMissing'));
            }
        }
    };

    const handleNextButtonClick = (event: React.MouseEvent): void => {
        event.preventDefault();
        if (username !== '') {
            handleNextToPasswordForm();
        } else {
            setAlert(t('validation.usernameMissing'));
        }
    };

    const handleNextToPasswordForm = (): void => {
        if (username !== '') {
            setDisplayState('password');
        }
    };

    const handlePasswordChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ): void => {
        setAlert('');
        setPassword(event.target.value.trim());
    };

    const handleBackToUsername = (): void => {
        setDisplayState('username');
    };

    const handleSubmitButtonClick = (event: React.MouseEvent): void => {
        event.preventDefault();
        if (password !== '') {
            submit();
        } else {
            setAlert(t('validation.passwordMissing'));
        }
    };

    const submit = async (): Promise<void> => {
        try {
            const response = await Axios.post(
                '/api/login',
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
    };

    return (
        <div className="m-auto">
            <div className="mx-auto">
                <img src={'/static/logo.png'} alt="Logo"></img>
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
                                <InputText
                                    id="username"
                                    onKeyDown={handleUsernameEnter}
                                    className="bg-white text-gray-800 focus:shadow-outline border-gray-300 py-2 px-2 block"
                                    type="text"
                                    autoFocus={true}
                                    onChange={handleUsernameChange}
                                    value={username}
                                ></InputText>
                            </div>
                            <div className="flex-row mt-4">
                                <Button
                                    onClick={handleNextButtonClick}
                                    text={t('common.next')}
                                ></Button>
                            </div>
                        </>
                    )}
                    {displayState === 'password' && (
                        <>
                            <div className="flex-row">
                                <InputText
                                    id="password"
                                    className="bg-white text-gray-800 focus:shadow-outline border-gray-300 py-2 px-2 block"
                                    type="password"
                                    autoFocus
                                    onChange={handlePasswordChange}
                                    value={password}
                                ></InputText>
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
                                    onClick={handleSubmitButtonClick}
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
