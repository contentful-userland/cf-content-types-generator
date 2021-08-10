import {Field, FieldType} from 'contentful';
import {ImportDeclarationStructure, OptionalKind, Project, SourceFile} from 'ts-morph';
import {CFContentType} from '../types';

export interface ContentTypeRenderer {

    setup(project: Project): void;

    render(contentType: CFContentType, file: SourceFile): void;

    createContext(): RenderContext;
}

export type FieldRenderer<FType extends FieldType> = (
    field: FType extends 'Link'
        ? Pick<Field, 'validations' | 'linkType'>
        : Field,
    context: RenderContext) => string;

export type FieldRenderers = {
    RichText: FieldRenderer<'RichText'>;
    Link: FieldRenderer<'Link'>;
    Array: FieldRenderer<'Array'>;
    Text: FieldRenderer<'Text'>;
    Symbol: FieldRenderer<'Symbol'>;
    Object: FieldRenderer<'Object'>;
    Date: FieldRenderer<'Date'>;
    Number: FieldRenderer<'Number'>;
    Integer: FieldRenderer<'Integer'>;
    Boolean: FieldRenderer<'Boolean'>;
    Location: FieldRenderer<'Location'>;
};

export type RenderContext = {
    getFieldRenderer: <FType extends FieldType>(fieldType: FType) => FieldRenderer<FType>;
    moduleName: (id: string) => string;
    moduleFieldsName: (id: string) => string;
    imports: Set<OptionalKind<ImportDeclarationStructure>>;
}
