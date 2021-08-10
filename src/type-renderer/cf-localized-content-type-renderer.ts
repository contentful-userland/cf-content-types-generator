import {Project, SourceFile} from 'ts-morph';
import {renderTypeGeneric} from '../renderer';
import {CFContentType} from '../types';
import {BaseContentTypeRenderer} from './cf-base-content-type-renderer';

export class LocalizedContentTypeRenderer extends BaseContentTypeRenderer {
    private readonly FILE_BASE_NAME = 'Localized'

    setup(project: Project): void {
        const file = project.createSourceFile(`${this.FILE_BASE_NAME}.ts`,
            // read localized-entry.ts with linebreaks
            undefined,
            {
                overwrite: true,
            });

        file.addStatements('/* utility types for localized entries */');
        file.addTypeAlias({
            name: 'LocalizedFields<Fields, Locales extends keyof any>',
            isExported: true,
            type: `{
                [FieldName in keyof Fields]?: {
                    [LocaleName in Locales]?: Fields[FieldName];
                }
            }`,
        });
        file.addTypeAlias({
            name: 'LocalizedEntry<EntryType, Locales extends keyof any>',
            isExported: true,
            type: `{
                [Key in keyof EntryType]:
                Key extends 'fields'
                    ? LocalizedFields<EntryType[Key], Locales>
                    : EntryType[Key]
            }`,
        });

        file.formatText();
    }

    render(contentType: CFContentType, file: SourceFile): void {
        const context = this.createContext();

        file.addTypeAlias({
            name: `Localized${context.moduleFieldsName(contentType.sys.id)}<Locale extends string | string[]>`,
            isExported: true,
            type: renderTypeGeneric('LocalizedFields', `${context.moduleFieldsName(contentType.sys.id)}, Locale`),
        });

        file.addTypeAlias({
            name: `Localized${context.moduleName(contentType.sys.id)}<Locale extends string | string[]>`,
            isExported: true,
            type: renderTypeGeneric('LocalizedEntry', `${context.moduleName(contentType.sys.id)}, Locale`),
        });

        context.imports.add({
            moduleSpecifier: `./${this.FILE_BASE_NAME}`,
            namedImports: ['LocalizedFields', 'LocalizedEntry'],
        });

        context.imports.forEach(structure => {
            file.addImportDeclaration(structure);
        });
    }
}

