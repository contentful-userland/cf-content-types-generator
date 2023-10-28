import { Project, SourceFile } from 'ts-morph';
import { renderTypeGeneric } from '../generic';
import { CFContentType, CFEditorInterface } from '../../types';
import { BaseContentTypeRenderer } from './base-content-type-renderer';
import { RenderContextOptions } from './create-default-context';
import { SetupOptions } from './content-type-renderer';

export class LocalizedContentTypeRenderer extends BaseContentTypeRenderer {
  private readonly FILE_BASE_NAME = 'Localized';

  private readonly files: SourceFile[];

  constructor() {
    super();
    this.files = [];
  }

  setup(project: Project, options: SetupOptions = {}): void {
    const file = project.createSourceFile(
      `${this.FILE_BASE_NAME}.ts`,
      // eslint-disable-next-line no-warning-comments
      // TODO: read from template file
      undefined,
      {
        overwrite: true,
      },
    );

    const { genericsPrefix = '' } = options;

    file.addStatements('/* Utility types for localized entries */');
    file.addTypeAlias({
      name: `LocalizedFields<${genericsPrefix}Fields, ${genericsPrefix}Locales extends keyof any>`,
      isExported: true,
      type: `{
                [${genericsPrefix}FieldName in keyof ${genericsPrefix}Fields]?: {
                    [${genericsPrefix}LocaleName in ${genericsPrefix}Locales]?: ${genericsPrefix}Fields[${genericsPrefix}FieldName];
                }
            }`,
    });
    file.addTypeAlias({
      name: `LocalizedEntry<${genericsPrefix}EntryType, ${genericsPrefix}Locales extends keyof any>`,
      isExported: true,
      type: `{
                [${genericsPrefix}Key in keyof ${genericsPrefix}EntryType]:
                ${genericsPrefix}Key extends 'fields'
                    ? LocalizedFields<${genericsPrefix}EntryType[${genericsPrefix}Key], ${genericsPrefix}Locales>
                    : ${genericsPrefix}EntryType[${genericsPrefix}Key]
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
