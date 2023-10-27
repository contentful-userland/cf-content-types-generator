import { Project, SourceFile } from 'ts-morph';
import { renderTypeGeneric } from '../generic';
import { CFContentType, CFEditorInterface } from '../../types';
import { BaseContentTypeRenderer } from './base-content-type-renderer';
import { RenderContextOptions } from './create-default-context';

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
      // eslint-disable-next-line no-warning-comments
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

  render(
    contentType: CFContentType,
    file: SourceFile,
    editorInterface?: CFEditorInterface,
    contextOptions: RenderContextOptions = {},
  ): void {
    const context = this.createContext(contextOptions);

    file.addTypeAlias({
      name: `Localized${context.moduleFieldsName(contentType.sys.id)}<${
        context.genericsPrefix ?? ''
      }Locales extends keyof any>`,
      isExported: true,
      type: renderTypeGeneric(
        'LocalizedFields',
        context.moduleFieldsName(contentType.sys.id),
        `${context.genericsPrefix ?? ''}Locales`,
      ),
    });

    file.addTypeAlias({
      name: `Localized${context.moduleName(contentType.sys.id)}<${
        context.genericsPrefix ?? ''
      }Locales extends keyof any>`,
      isExported: true,
      type: renderTypeGeneric(
        'LocalizedEntry',
        context.moduleName(contentType.sys.id),
        `${context.genericsPrefix ?? ''}Locales`,
      ),
    });

    context.imports.add({
      moduleSpecifier: `./${this.FILE_BASE_NAME}`,
      namedImports: ['LocalizedFields', 'LocalizedEntry'],
      isTypeOnly: true,
    });

    for (const structure of context.imports) {
      file.addImportDeclaration(structure);
    }
  }

  public additionalFiles(): SourceFile[] {
    return this.files;
  }
}
