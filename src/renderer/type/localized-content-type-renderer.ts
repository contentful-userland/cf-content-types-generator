import {Project, SourceFile} from 'ts-morph';
import {renderTypeGeneric} from '../generic';
import {CFContentType} from '../../types';
import {BaseContentTypeRenderer} from './base-content-type-renderer';

export class LocalizedContentTypeRenderer extends BaseContentTypeRenderer {
  private readonly FILE_BASE_NAME = 'Localized';

  private readonly files: SourceFile[];

  constructor() {
      super();
      this.files = [];
  }

  setup(project: Project): void {
      const file = project.createSourceFile(
          `${this.FILE_BASE_NAME}.ts`,
          // TODO: read from template file
          undefined,
          {
              overwrite: true,
          },
      );

      file.addStatements('/* Utility types for localized entries */');
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
      this.files.push(file);
  }

  render(contentType: CFContentType, file: SourceFile): void {
      const context = this.createContext();

      file.addTypeAlias({
          name: `Localized${context.moduleFieldsName(contentType.sys.id)}<Locales extends keyof any>`,
          isExported: true,
          type: renderTypeGeneric(
              'LocalizedFields',
              `${context.moduleFieldsName(contentType.sys.id)}, Locales`,
          ),
      });

      file.addTypeAlias({
          name: `Localized${context.moduleName(contentType.sys.id)}<Locales extends keyof any>`,
          isExported: true,
          type: renderTypeGeneric(
              'LocalizedEntry',
              `${context.moduleName(contentType.sys.id)}, Locales`,
          ),
      });

      context.imports.add({
          moduleSpecifier: `./${this.FILE_BASE_NAME}`,
          namedImports: ['LocalizedFields', 'LocalizedEntry'],
      });

      for (const structure of context.imports) {
          file.addImportDeclaration(structure);
      }
  }

  public additionalFiles(): SourceFile[] {
      return this.files;
  }
}
