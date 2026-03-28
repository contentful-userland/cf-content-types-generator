import {
  forEachStructureChild,
  ImportDeclarationStructure,
  OptionalKind,
  Project,
  SourceFile,
  StructureKind,
} from 'ts-morph';
import { flatten } from 'lodash';
import { WriteCallback } from '../types';
import { Renderer } from '../renderer';

export class DefinitionsOutputWriter {
  constructor(
    private readonly project: Project,
    private readonly renderers: Renderer[],
  ) {}

  public write = async (dir: string, writeCallback: WriteCallback): Promise<void> => {
    this.addIndexFile();

    if (dir.endsWith('/')) {
      dir = dir.slice(0, -1);
    }

    const writePromises = this.project.getSourceFiles().map((file) => {
      const targetPath = `${dir}${file.getFilePath()}`;
      file.formatText();
      return writeCallback(targetPath, file.getFullText());
    });
    await Promise.all(writePromises);

    this.removeIndexFile();
  };

  public toString = (): string => {
    const mergeFileName = 'ContentTypes';
    const mergeFile = this.addFile(mergeFileName);

    const imports: OptionalKind<ImportDeclarationStructure>[] = [];
    const types: string[] = [];

    for (const sourceFile of this.project.getSourceFiles().filter((currentSourceFile) => {
      return currentSourceFile.getBaseNameWithoutExtension() !== mergeFileName;
    })) {
      forEachStructureChild(sourceFile.getStructure(), (childStructure) => {
        switch (childStructure.kind) {
          case StructureKind.ImportDeclaration:
            imports.push(childStructure);
            break;
          case StructureKind.Interface:
            types.push(childStructure.name);
            mergeFile.addInterface(childStructure);
            break;
          case StructureKind.TypeAlias:
            types.push(childStructure.name);
            mergeFile.addTypeAlias(childStructure);
            break;
          case StructureKind.Function:
            mergeFile.addFunction(childStructure);
            break;
          default:
            throw new Error(`Unhandled node type '${StructureKind[childStructure.kind]}'.`);
        }
      });
    }

    const additionalFiles = flatten(
      this.renderers.map((renderer) => {
        return renderer.additionalFiles();
      }),
    );
    const additionalFileNames = new Set(
      additionalFiles.map((file) => file.getBaseNameWithoutExtension()),
    );

    for (const importDeclaration of imports) {
      const name = importDeclaration.moduleSpecifier.startsWith('./')
        ? importDeclaration.moduleSpecifier.slice(2)
        : importDeclaration.moduleSpecifier;

      if (!types.includes(name) && !additionalFileNames.has(name)) {
        mergeFile.addImportDeclaration(importDeclaration);
      }
    }

    mergeFile.organizeImports({
      ensureNewLineAtEndOfFile: true,
    });

    mergeFile.formatText();

    const fullText = mergeFile.getFullText();
    this.project.removeSourceFile(mergeFile);

    return fullText;
  };

  private addFile = (name: string): SourceFile => {
    return this.project.createSourceFile(`${name}.ts`, undefined, {
      overwrite: true,
    });
  };

  private getIndexFile = (): SourceFile | undefined => {
    return this.project.getSourceFile((file) => {
      return file.getBaseNameWithoutExtension() === 'index';
    });
  };

  private addIndexFile = (): void => {
    this.removeIndexFile();

    const indexFile = this.addFile('index');

    for (const sourceFile of this.project.getSourceFiles()) {
      const exportDeclarations = sourceFile.getExportSymbols();
      if (sourceFile.getBaseNameWithoutExtension() !== 'index') {
        for (const exportDeclaration of exportDeclarations) {
          indexFile.addExportDeclaration({
            isTypeOnly: !sourceFile.getFunctions().some((fn) => {
              return fn.getName() === exportDeclaration.getExportSymbol().getName();
            }),
            namedExports: [exportDeclaration.getExportSymbol().getEscapedName()],
            moduleSpecifier: `./${sourceFile.getBaseNameWithoutExtension()}`,
          });
        }
      }
    }

    indexFile.organizeImports();
  };

  private removeIndexFile = () => {
    const indexFile = this.getIndexFile();
    if (indexFile) {
      this.project.removeSourceFile(indexFile);
    }
  };
}
