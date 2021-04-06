import {Field, FieldType} from 'contentful';
import {InterfaceDeclaration, SourceFile} from 'ts-morph';
import {CFContentType} from './cf-definitions-builder';
import {propertyImports} from './cf-property-imports';
import {renderTypeGeneric} from './renderer';
import {FieldRenderer, RenderContext} from './renderer/render-types';
import {defaultRenderers} from './type-renderer';
import {moduleFieldsName, moduleName} from './utils';

export class ContentTypeRenderer {
    public render(contentType: CFContentType, file: SourceFile) {
        file.addImportDeclaration({
            moduleSpecifier: 'contentful',
            namespaceImport: 'Contentful',
        });
        file.addImportDeclaration({
            moduleSpecifier: '@contentful/rich-text-types',
            namespaceImport: 'CFRichTextTypes',
        });
        this.renderFieldsInterface(contentType, file);
        this.renderEntryTypeAlias(contentType, file);
    }

    public renderFieldsInterface(contentType: CFContentType, file: SourceFile) {
        const fieldsInterfaceName = this.getContext().moduleFieldsName(contentType.sys.id);
        const interfaceDeclaration = file.addInterface({name: fieldsInterfaceName, isExported: true});
        contentType.fields.forEach(field => {
            this.renderField(field, interfaceDeclaration);
            file.addImportDeclarations(propertyImports(field, file.getBaseNameWithoutExtension()));
        });
    }

    protected renderField(field: Field, interfaceDeclaration: InterfaceDeclaration) {
        const fieldRenderer = this.getContext().getRenderer(field.type);
        interfaceDeclaration.addProperty({
            name: field.id,
            hasQuestionToken: field.omitted || (!field.required),
            type: fieldRenderer(field, this.getContext()),
        });
    }

    protected renderEntryTypeAlias(contentType: CFContentType, file: SourceFile) {
        const fieldsInterfaceName = this.getContext().moduleFieldsName(contentType.sys.id);
        file.addTypeAlias({
            isExported: true,
            name: this.getContext().moduleName(contentType.sys.id),
            type: renderTypeGeneric('Contentful.Entry', fieldsInterfaceName),
        });
    }

    protected getContext(): RenderContext {
        return {
            moduleName,
            moduleFieldsName,
            getRenderer: <FType extends FieldType>(fieldType: FType) => defaultRenderers[fieldType] as FieldRenderer<FType>,
        };
    }
}
