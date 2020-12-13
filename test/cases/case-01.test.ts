import {expect} from "@oclif/test";
import {readFileSync} from "fs-extra";
import * as path from "path";
import CFDefinitionsBuilder from "../../src/cf-definitions-builder";

function testCase(id: string, description: string) {
    it(description, () => {
        let builder = new CFDefinitionsBuilder();
        const fixture = require(`./fixtures/${id}-input.json`)
        fixture.contentTypes.forEach((contentType: any) => builder.appendType(contentType));
        expect(builder.toString(), description).to.eql(
            readFileSync(path.resolve(__dirname, `./fixtures/${id}-output.txt`)).toString())
    });
}

describe('cases', () => {
    testCase('01', '"TypeBrandFields" correctly linked in "TypeProductFields"');
});
