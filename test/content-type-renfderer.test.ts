import { expect } from 'chai';
import { Project, ScriptTarget, SourceFile } from 'ts-morph';
import { CFContentType } from '../src/cf-definitions-builder';
import {ContentTypeRenderer} from '../src/content-type-renderer';
import { Field, FieldType } from 'contentful';
import stripIndent = require('strip-indent');

describe('A derived content type renderer class', () => {

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

    it('can return a custom field renderer', () => {
        class DerivedContentTypeRenderer extends ContentTypeRenderer {
            protected getRenderer(fieldType: FieldType): Function {
                if(fieldType === 'Symbol'){
                    return (field: Field) => 'Test.Symbol'
                } 
                return super.getRenderer(fieldType)
            }
        }
        
        const renderer = new DerivedContentTypeRenderer();

        const contentType: CFContentType = {
            id: 'unused-id',
            name: 'unused-name',
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
        import * as Contentful from "contentful";
        import * as CFRichTextTypes from "@contentful/rich-text-types";
        
        export interface TypeTestFields {
            field_id: Test.Symbol;
        }
        
        export type TypeTest = Contentful.Entry<TypeTestFields>;
        `));
    })

})