import { checkIfPathExistsAndIsAbsolute } from './helpers.js';

describe('Test checkIfPathExistsAndIsAbsolute', () => {
    it('Throws if no path', () => {
        expect(() => checkIfPathExistsAndIsAbsolute('', 'irrelevantName')).toThrow('Path not set: irrelevantName');
    });

    it('Calls out non-absolute paths', () => {
        expect(() => checkIfPathExistsAndIsAbsolute('my/path0', 'irrelevantName')).toThrow(
            'Path not absolute: irrelevantName'
        );
    });

    it("Doesn't throw on absolute paths", () => {
        expect(() => checkIfPathExistsAndIsAbsolute('/home/username/my/path0', 'irrelevantName')).not.toThrow();
    });
});
