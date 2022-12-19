import isAbsolute from 'is-absolute';

export const checkIfPathExistsAndIsAbsolute = (
    configPath: string | undefined | null,
    pathNameForDebug: string
): void => {
    if (!configPath) {
        throw new Error('Path not set: ' + pathNameForDebug);
    }

    if (!isAbsolute(configPath)) {
        throw new Error('Path not absolute: ' + pathNameForDebug);
    }
};
