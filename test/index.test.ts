import {test} from '@oclif/test';
import cmd = require('../src/index');

describe('cf-content-types-generator cli', () => {
    test
        .stdout()
        .do(() => cmd.run(['invalid-file.json']))
        .catch('file invalid-file.json doesn\'t exists.')
        .it('throws on invalid file name');

    test
        .stdout()
        .do(() => cmd.run(['--spaceId', 'random']))
        .catch('Please specify "token".')
        .it('throws on missing token');

    test
        .stdout()
        .do(() => cmd.run(['--token', 'random']))
        .catch('Please specify "spaceId".')
        .it('throws on missing spaceId');
});
