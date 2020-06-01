import React, { ReactElement } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faAngleUp,
    faCloudUploadAlt,
    faUser,
    faGlobe
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

interface Props {
    activeTab: 'user' | 'web' | 'file';
    changeTab: Function;
    isUploading: boolean;
    toggleCollapseAddMediaMenu: React.MouseEventHandler;
}

export default function AddMediaTabBar({
    activeTab,
    changeTab,
    isUploading,
    toggleCollapseAddMediaMenu
}: Props): ReactElement {
    const { t } = useTranslation();

    return (
        <div className="flex flex-row mb-2 justify-between">
            <ul className="flex">
                <li className="mr-3">
                    <button
                        className={
                            'inline-block border rounded py-1 px-3 mb-2' +
                            (activeTab === 'user' ? ' text-black bg-white' : '')
                        }
                        onClick={(): void => changeTab('user')}
                        title={t('mediaMenu.addUserTab')}
                    >
                        <FontAwesomeIcon
                            className={
                                activeTab === 'user'
                                    ? ' text-black bg-white'
                                    : ''
                            }
                            icon={faUser}
                        ></FontAwesomeIcon>
                    </button>
                </li>
                <li className="mr-3">
                    <button
                        className={
                            'inline-block border rounded py-1 px-3 mb-2' +
                            (activeTab === 'web' ? ' text-black bg-white' : '')
                        }
                        onClick={(): void => changeTab('web')}
                        title={t('mediaMenu.addWebTab')}
                    >
                        <FontAwesomeIcon
                            className={
                                activeTab === 'web'
                                    ? ' text-black bg-white'
                                    : ''
                            }
                            icon={faGlobe}
                        ></FontAwesomeIcon>
                    </button>
                </li>
                <li className="mr-3">
                    <button
                        className={
                            'inline-block border rounded py-1 px-3 mb-2' +
                            (activeTab === 'file' ? ' text-black bg-white' : '')
                        }
                        onClick={(): void => changeTab('file')}
                        title={t('mediaMenu.addFileTab')}
                    >
                        <FontAwesomeIcon
                            className={
                                activeTab === 'file'
                                    ? ' text-black bg-white'
                                    : ''
                            }
                            icon={faCloudUploadAlt}
                        ></FontAwesomeIcon>
                    </button>
                </li>
            </ul>
            <div>
                {!isUploading && (
                    <div
                        className="p-1 cursor-pointer"
                        onClick={toggleCollapseAddMediaMenu}
                        title={t('mediaMenu.collapseTitle')}
                    >
                        <FontAwesomeIcon
                            className="text-gray-200 hover:text-gray-100"
                            size="lg"
                            icon={faAngleUp}
                        ></FontAwesomeIcon>
                    </div>
                )}
            </div>
        </div>
    );
}
