import { Project, SourceFile } from 'ts-morph';
import { CFContentType, CFEditorInterface } from '../../types';
import { BaseContentTypeRenderer } from './base-content-type-renderer';
import { renderTypeGeneric } from '../generic';
import { RenderContextOptions } from './create-default-context';

export class V10TypeGuardRenderer extends BaseContentTypeRenderer {
  private readonly files: SourceFile[];

  private static readonly WithContentTypeLink = 'WithContentTypeLink';
  constructor() {
    super();
    this.files = [];
  }

  public override setup(project: Project): void {
    super.setup(project);
  }

  public override render(
    contentType: CFContentType,
    file: SourceFile,
    editorInterface?: CFEditorInterface,
    contextOptions: RenderContextOptions = {},
  ): void {
    const context = this.createContext(contextOptions);

    const entryInterfaceName = context.moduleName(contentType.sys.id);

    file.addImportDeclaration({
      moduleSpecifier: `contentful`,
      namedImports: ['ChainModifiers', 'Entry', 'LocaleCode'],
      isTypeOnly: true,
    });

    file.addFunction({
      isExported: true,
      name: renderTypeGeneric(
        `is${entryInterfaceName}`,
        `${context.genericsPrefix ?? ''}Modifiers extends ChainModifiers`,
        `${context.genericsPrefix ?? ''}Locales extends LocaleCode`,
      ),
      returnType: `entry is ${renderTypeGeneric(
        entryInterfaceName,
        `${context.genericsPrefix ?? ''}Modifiers`,
        `${context.genericsPrefix ?? ''}Locales`,
      )}`,
      parameters: [
        {
          name: 'entry',
          type: renderTypeGeneric(
            'Entry',
            'EntrySkeletonType',
            `${context.genericsPrefix ?? ''}Modifiers`,
            `${context.genericsPrefix ?? ''}Locales`,
          ),
        },
      ],
      statements: `return entry.sys.contentType.sys.id === '${contentType.sys.id}'`,
    });

    file.organizeImports({
      ensureNewLineAtEndOfFile: true,
    });

    file.formatText();
  }

  public override additionalFiles(): SourceFile[] {
    return this.files;
  }
}
