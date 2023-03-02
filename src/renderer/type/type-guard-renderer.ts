import { SourceFile } from 'ts-morph';
import { CFContentType } from '../../types';
import { BaseContentTypeRenderer } from './base-content-type-renderer';

export class TypeGuardRenderer extends BaseContentTypeRenderer {
  public render = (contentType: CFContentType, file: SourceFile): void => {
    const context = this.createContext();

    const entryInterfaceName = context.moduleName(contentType.sys.id);

    context.imports.add({
      moduleSpecifier: 'contentful',
      namedImports: ['ContentTypeLink'],
      isTypeOnly: true,
    });

    file.addFunction({
      isExported: true,
      name: `is${entryInterfaceName}`,
      returnType: `entry is ${entryInterfaceName}`,
      parameters: [
        {
          name: 'entry',
          type: '{ sys: { contentType: { sys: { id: string } } } }',
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
