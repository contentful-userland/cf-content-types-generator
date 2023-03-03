import { Project, SourceFile } from 'ts-morph';
import { moduleName } from '../../module-name';
import { CFContentType } from '../../types';
import { BaseContentTypeRenderer } from './base-content-type-renderer';

export class TypeGuardRenderer extends BaseContentTypeRenderer {
  private readonly files: SourceFile[];

  private static readonly WithContentTypeLink = 'WithContentTypeLink';
  constructor() {
    super();
    this.files = [];
  }

  public override setup(project: Project): void {
    super.setup(project);
    const file = project.createSourceFile(`TypeGuardTypes.ts`, undefined, {
      overwrite: true,
    });

    file.addTypeAlias({
      name: TypeGuardRenderer.WithContentTypeLink,
      isExported: true,
      type: `{ sys: { contentType: { sys: { id: string } } } }`,
    });
    file.formatText();
    this.files.push(file);
  }

  public render = (contentType: CFContentType, file: SourceFile): void => {
    const entryInterfaceName = moduleName(contentType.sys.id);

    file.addImportDeclaration({
      moduleSpecifier: 'TypeGuardTypes',
      namedImports: [TypeGuardRenderer.WithContentTypeLink],
      isTypeOnly: true,
    });

    file.addFunction({
      isExported: true,
      name: `is${entryInterfaceName}`,
      returnType: `entry is ${entryInterfaceName}`,
      parameters: [
        {
          name: 'entry',
          type: TypeGuardRenderer.WithContentTypeLink,
        },
      ],
      statements: `return entry.sys.contentType.sys.id === '${contentType.sys.id}'`,
    });

    file.organizeImports({
      ensureNewLineAtEndOfFile: true,
    });

    file.formatText();
  };
}
