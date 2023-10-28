import { readFileSync } from 'fs-extra';
import * as path from 'node:path';
import CFDefinitionsBuilder from '../../src/cf-definitions-builder';

function testCase(id: string, description: string) {
  // eslint-disable-next-line jest/valid-title
  it(description, async () => {
    const builder = new CFDefinitionsBuilder();
    const fixture = await import(`./fixtures/${id}-input.json`);
    for (const contentType of fixture.contentTypes) {
      builder.appendType(contentType);
    }

    expect(builder.toString()).toEqual(
      // eslint-disable-next-line unicorn/prefer-module
      readFileSync(path.resolve(__dirname, `./fixtures/${id}-output.txt`)).toString(),
    );
  });
}

describe('cases', () => {
  testCase('01', '"TypeBrandFields" correctly linked in "TypeProductFields"');
});
