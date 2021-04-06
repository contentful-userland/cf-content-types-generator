import { expect } from 'chai';
import { InterfaceDeclaration, Project, ScriptTarget, SourceFile } from 'ts-morph';
import { CFContentType } from '../src/cf-definitions-builder';
import {ContentTypeRenderer} from '../src/content-type-renderer';
import { Field, FieldType } from 'contentful';
import stripIndent = require('strip-indent');
import { FieldRenderer, FieldRenderers } from '../src/renderer/render-types';
import { renderTypeGeneric } from '../src/renderer';

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

    it('can return a custom field type renderer', () => {
        class DerivedContentTypeRenderer extends ContentTypeRenderer {
            protected getRenderer<FType extends FieldType>(fieldType: FType): FieldRenderer<FType> {
                if(fieldType === 'Symbol') {
                    return () => 'Test.Symbol'
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

    it('can return a custom field renderer with docs support', () => {
        class DerivedContentTypeRenderer extends ContentTypeRenderer {
            protected renderField(field: Field, interfaceDeclaration: InterfaceDeclaration) {
                const fieldRenderer = this.getContext().getRenderer(field.type);
                interfaceDeclaration.addProperty({
                    docs: [{description: `Field of type "${field.type}"`}], 
                    name: field.id,
                    hasQuestionToken: field.omitted || (!field.required),
                    type: fieldRenderer(field, this.getContext()),
                });
            }
            protected renderEntryTypeAlias(contentType: CFContentType, file: SourceFile) {
                const fieldsInterfaceName = this.getContext().moduleFieldsName(contentType.sys.id);
                file.addTypeAlias({
                    docs: [{description: `content type "${contentType.name}" with id: ${contentType.sys.id}`}], 
                    isExported: true,
                    name: this.getContext().moduleName(contentType.sys.id),
                    type: renderTypeGeneric('Contentful.Entry', fieldsInterfaceName),
                });
            }
        }
        
        const renderer = new DerivedContentTypeRenderer();

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
        import * as Contentful from "contentful";
        import * as CFRichTextTypes from "@contentful/rich-text-types";
        
        export interface TypeTestFields {
            /** Field of type "Symbol" */
            field_id: Contentful.EntryFields.Symbol;
        }
        
        /** content type "display name" with id: test */
        export type TypeTest = Contentful.Entry<TypeTestFields>;
        `));
    })

})