import { Project, SourceFile } from 'ts-morph';
import { moduleName } from '../../module-name';
import { CFContentType } from '../../types';
import { BaseContentTypeRenderer } from './base-content-type-renderer';
import { renderTypeGeneric } from '../generic';

export class TypeGuardRenderer extends BaseContentTypeRenderer {
  private readonly files: SourceFile[];

  constructor() {
    super();
    this.files = [];
  }

  public override setup(project: Project): void {
    super.setup(project);
  }

  public render = (contentType: CFContentType, file: SourceFile): void => {
    const entryInterfaceName = moduleName(contentType.sys.id);

    file.addImportDeclaration({
      moduleSpecifier: `contentful`,
      namedImports: ['ChainModifiers', 'Entry', 'EntrySkeletonType', 'LocaleCode'],
      isTypeOnly: true,
    });

    const returnType = `entry is ${renderTypeGeneric(entryInterfaceName, 'Modifiers', 'Locales')}`;

    file.addFunction({
      isExported: true,
      name: renderTypeGeneric(
        `is${entryInterfaceName}`,
        'Modifiers extends ChainModifiers',
        'Locales extends LocaleCode',
      ),
      returnType,
      parameters: [
        {
          name: 'entry',
          type: 'unknown',
        },
      ],
      statements: [
        `const candidate = entry as { sys?: { contentType?: { sys?: { id?: string } } } };`,
        `return candidate.sys?.contentType?.sys?.id === '${contentType.sys.id}'`,
      ],
      overloads: [
        {
          isExported: true,
          returnType,
          parameters: [
            {
              name: 'entry',
              type: renderTypeGeneric('Entry', 'EntrySkeletonType', 'Modifiers', 'Locales'),
              hasQuestionToken: true,
            },
          ],
        },
        {
          isExported: true,
          returnType,
          parameters: [
            {
              name: 'entry',
              type: 'unknown',
            },
          ],
        },
      ],
    });

    file.organizeImports({
      ensureNewLineAtEndOfFile: true,
    });

    file.formatText();
  };

  public override additionalFiles(): SourceFile[] {
    return this.files;
  }
}
