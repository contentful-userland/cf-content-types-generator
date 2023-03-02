import { Project, SourceFile } from 'ts-morph';
import { CFContentType } from '../../types';
import { BaseContentTypeRenderer } from './base-content-type-renderer';

export class TypeGuardRenderer extends BaseContentTypeRenderer {
  private readonly files: SourceFile[];

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
      name: 'SysWithContentTypeLinkId',
      isExported: true,
      type: `{ sys: { contentType: { sys: { id: string } } } }`,
    });
    file.formatText();
    this.files.push(file);
  }

  public render = (contentType: CFContentType, file: SourceFile): void => {
    const context = this.createContext();

    const entryInterfaceName = context.moduleName(contentType.sys.id);

    context.imports.add({
      moduleSpecifier: 'TypeGuardTypes',
      namedImports: ['SysWithContentTypeLinkId'],
      isTypeOnly: true,
    });

    file.addFunction({
      isExported: true,
      name: `is${entryInterfaceName}`,
      returnType: `entry is ${entryInterfaceName}`,
      parameters: [
        {
          name: 'entry',
          type: 'SysWithContentTypeLinkId',
        },
      ],
      statements: `return entry.sys.contentType.sys.id === '${contentType.sys.id}'`,
    });

    for (const structure of context.imports) {
      file.addImportDeclaration(structure);
    }

    file.organizeImports({
      ensureNewLineAtEndOfFile: true,
    });

    file.formatText();
  };
}
