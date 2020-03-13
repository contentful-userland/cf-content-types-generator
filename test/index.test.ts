import {test} from '@oclif/test';
import cmd = require('../src/index');

describe.skip('contentful-ctg cli', () => {
    test
        .stdout()
        .do(() => cmd.run([]))
        .catch('file undefined doesn\'t exists.')
        .it('throws on missing first positional');
});
