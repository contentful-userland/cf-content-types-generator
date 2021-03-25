import {Field, FieldType} from 'contentful';
import {InterfaceDeclaration, SourceFile} from 'ts-morph';
import {CFContentType} from './cf-definitions-builder';
import {propertyImports} from './cf-property-imports';
import {renderRichText, renderPropLink, renderPropArray, renderPropAny} from './type-renderer';
import {FieldRenderers} from './renderer/render-types';
import {moduleFieldsName, moduleName} from './utils';
import {renderTypeGeneric} from './renderer';

const defaultRenderers: FieldRenderers = {
    RichText: renderRichText,
    Link: renderPropLink,
    Array: renderPropArray,
    Text: renderPropAny,
    Symbol: renderPropAny,
    Object: renderPropAny,
    Date: renderPropAny,
    Number: renderPropAny,
    Integer: renderPropAny,
    Boolean: renderPropAny,
    Location: renderPropAny,
};

export class ContentTypeRenderer {
    public static fieldRenderers: Partial<FieldRenderers>;

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
        const fieldsInterfaceName = moduleFieldsName(contentType.sys.id);
        const interfaceDeclaration = file.addInterface({name: fieldsInterfaceName, isExported: true});
        contentType.fields.forEach(field => {
            this.renderField(field, interfaceDeclaration);
            file.addImportDeclarations(propertyImports(field, file.getBaseNameWithoutExtension()));
        });
    }

    public renderField(field: Field, interfaceDeclaration: InterfaceDeclaration) {
        interfaceDeclaration.addProperty({
            name: field.id,
            hasQuestionToken: field.omitted || (!field.required),
            type: this.getRenderer(field.type)(field),
        });
    }

    public renderEntryTypeAlias(contentType: CFContentType, file: SourceFile) {
        const fieldsInterfaceName = moduleFieldsName(contentType.sys.id);
        file.addTypeAlias({
            isExported: true,
            name: moduleName(contentType.sys.id),
            type: renderTypeGeneric('Contentful.Entry', fieldsInterfaceName),
        });
    }

    private getRenderer(fieldType: FieldType): Function {
        const RendererClass = Object.getPrototypeOf(this).constructor;
        return RendererClass.fieldRenderers?.getProperty(fieldType) || defaultRenderers[fieldType];
    }
}
