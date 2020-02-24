import TSDefinitionBuilder from '../src/ts-definition-builder';
import {expect} from '@oclif/test';
import stripIndent = require('strip-indent');

describe('a typescript definition builder', () => {
    const testTypeName = 'TestType';
    let builder: TSDefinitionBuilder;

    beforeEach(() => {
        builder = new TSDefinitionBuilder(testTypeName);
    });

    it('by default exports as type', () => {
        builder.appendStringField('name');
        expect('\n' + builder.toString()).to.equal(stripIndent(`
                type TestType = {
                    name?: string;
                }`));
    });

    it('can export as interface', () => {
        builder = new TSDefinitionBuilder(testTypeName, {type: 'interface'});
        builder.appendStringField('name');
        expect('\n' + builder.toString()).to.equal(stripIndent(`
                interface TestType {
                    name?: string;
                }`));
    });

    it('can append import', () => {
        builder.appendStringField('name');
        builder.appendImport('import * as Contentful from "contentful"');
        expect('\n' + builder.toString()).to.equal(stripIndent(`
                import * as Contentful from "contentful"
                type TestType = {
                    name?: string;
                }`));
    });

    it('can append multiple imports', () => {
        builder.appendStringField('name');
        builder.appendImport('import * as Contentful from "contentful"');
        builder.appendImport('import * as CF from "contentful"');
        expect('\n' + builder.toString()).to.equal(stripIndent(`
                import * as Contentful from "contentful"
                import * as CF from "contentful"
                type TestType = {
                    name?: string;
                }`));
    });
});
