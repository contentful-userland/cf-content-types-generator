import {expect} from 'chai';
import {Project, ScriptTarget, SourceFile} from 'ts-morph';
import {LocalizedContentTypeRenderer} from "../../../src/renderer/type";
import {CFContentType} from '../../../src/types';
import stripIndent = require('strip-indent');

describe('A localized content type renderer class', () => {

    let project: Project;
    let testFile: SourceFile;

    beforeEach(() => {
        project = new Project({
            useInMemoryFileSystem: true,
            compilerOptions: {
                target: ScriptTarget.ES5,
                declaration: true,
            },
        });
        testFile = project.createSourceFile('test.ts');
    })

    it('adds localized-entry.ts on setup', () => {

        const renderer = new LocalizedContentTypeRenderer();
        renderer.setup(project);

        const file = project.getSourceFile('Localized.ts')

        expect(file?.getFullText()).to.equal(stripIndent(`
        /* utility types for localized entries */
        export type LocalizedFields<Fields, Locales extends keyof any> = {
            [FieldName in keyof Fields]?: {
                [LocaleName in Locales]?: Fields[FieldName];
            }
        };
        export type LocalizedEntry<EntryType, Locales extends keyof any> = {
            [Key in keyof EntryType]:
            Key extends 'fields'
            ? LocalizedFields<EntryType[Key], Locales>
            : EntryType[Key]
        };
        `.replace(/.*/, "").substr(1)));
    })

    it('can render a localized entry and fields', () => {
        const renderer = new LocalizedContentTypeRenderer();

        const contentType: CFContentType = {
            id: 'unused-id',
            name: 'display name',
            sys: {
                id: 'test',
                type: 'Symbol'
            },
            fields: [{
                id: 'field_id',
                name: 'field_name',
                disabled: false,
                localized: false,
                required: true,
                type: 'Symbol',
                omitted: false,
                validations: []
            }]
        }

        renderer.render(contentType, testFile);

        expect('\n' + testFile.getFullText()).to.equal(stripIndent(`
        import { LocalizedFields, LocalizedEntry } from "./Localized";
        
        export type LocalizedTypeTestFields<Locale extends string | string[]> = LocalizedFields<TypeTestFields, Locale>;
        export type LocalizedTypeTest<Locale extends string | string[]> = LocalizedEntry<TypeTest, Locale>;
        `));
    })

})
