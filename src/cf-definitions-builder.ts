import * as path from 'node:path';
import {
  forEachStructureChild,
  ImportDeclarationStructure,
  OptionalKind,
  Project,
  ScriptTarget,
  SourceFile,
  StructureKind,
} from 'ts-morph';
import { moduleName } from './module-name';
import { ContentTypeRenderer, DefaultContentTypeRenderer } from './renderer/type';
import { CFContentType, WriteCallback } from './types';
import { flatten } from 'lodash';

export default class CFDefinitionsBuilder {
  private readonly project: Project;

  private contentTypeRenderers: ContentTypeRenderer[];

  constructor(contentTypeRenderers: ContentTypeRenderer[] = []) {
    if (contentTypeRenderers.length === 0) {
      contentTypeRenderers.push(new DefaultContentTypeRenderer());
    }

    this.contentTypeRenderers = contentTypeRenderers;
    this.project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        target: ScriptTarget.ES5,
        declaration: true,
      },
    });

    for (const renderer of this.contentTypeRenderers) renderer.setup(this.project);
  }

  public appendType = (model: CFContentType): CFDefinitionsBuilder => {
    if (model.sys.type !== 'ContentType') {
      throw new Error('given data is not describing a ContentType');
    }

    const file = this.addFile(moduleName(model.sys.id));
    for (const renderer of this.contentTypeRenderers) renderer.render(model, file);

    file.organizeImports({
      ensureNewLineAtEndOfFile: true,
    });

    return this;
  };

  public appendTypes = (models: CFContentType[]): CFDefinitionsBuilder => {
    for (const model of models) this.appendType(model);

    return this;
  };

  public write = async (dir: string, writeCallback: WriteCallback): Promise<void> => {
    this.addIndexFile();

    const writePromises = this.project.getSourceFiles().map((file) => {
      const targetPath = path.resolve(dir, file.getFilePath().slice(1));
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

    for (const sourceFile of this.project.getSourceFiles().filter((sourceFile) => {
      return sourceFile.getBaseNameWithoutExtension() !== mergeFileName;
    }))
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
          default:
            throw new Error(`Unhandled node type '${StructureKind[childStructure.kind]}'.`);
        }
      });

    const additionalFiles = flatten(
      this.contentTypeRenderers.map((renderer) => {
        return renderer.additionalFiles();
      }),
    );
    const additionalFileNames = new Set(
      additionalFiles.map((file) => file.getBaseNameWithoutExtension()),
    );

    // only import modules not present in merge file and not present in additional files
    for (const importD of imports) {
      const name = importD.moduleSpecifier.slice(2);
      if (!types.includes(name) && !additionalFileNames.has(name)) {
        mergeFile.addImportDeclaration(importD);
      }
    }

    mergeFile.organizeImports({
      ensureNewLineAtEndOfFile: true,
    });

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

    // this assumes all things are named exports
    // maybe use https://github.com/dsherret/ts-morph/issues/165#issuecomment-350522329
    for (const sourceFile of this.project.getSourceFiles()) {
      const exportDeclarations = sourceFile.getExportSymbols();
      if (sourceFile.getBaseNameWithoutExtension() !== 'index') {
        indexFile.addExportDeclaration({
          isTypeOnly: true,
          namedExports: exportDeclarations.map((declaration) =>
            declaration.getExportSymbol().getEscapedName(),
          ),
          moduleSpecifier: `./${sourceFile.getBaseNameWithoutExtension()}`,
        });
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
