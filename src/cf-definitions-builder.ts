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
import { ContentTypeRenderer, DefaultContentTypeRenderer } from './renderer';
import { CFContentType, CFEditorInterface, WriteCallback } from './types';
import { flatten } from 'lodash';
import { RenderContextOptions } from './renderer/type/create-default-context';

export default class CFDefinitionsBuilder {
  private readonly project: Project;

  private readonly contentTypeRenderers: ContentTypeRenderer[];
  private readonly renderContextOptions: RenderContextOptions;

  constructor(
    contentTypeRenderers: ContentTypeRenderer[] = [],
    options: RenderContextOptions = {},
  ) {
    if (contentTypeRenderers.length === 0) {
      contentTypeRenderers.push(new DefaultContentTypeRenderer());
    }

    this.renderContextOptions = options;
    this.contentTypeRenderers = contentTypeRenderers;
    this.project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        target: ScriptTarget.ES5,
        declaration: true,
      },
    });

    for (const renderer of this.contentTypeRenderers) {
      renderer.setup(this.project, options);
    }
  }

  public appendType = (
    model: CFContentType,
    editorInterface?: CFEditorInterface,
  ): CFDefinitionsBuilder => {
    if (model.sys.type !== 'ContentType') {
      throw new Error('given data is not describing a ContentType');
    }

    const file = this.addFile(moduleName(model.sys.id));
    for (const renderer of this.contentTypeRenderers) {
      renderer.render(model, file, editorInterface, this.renderContextOptions);
    }

    file.organizeImports({
      ensureNewLineAtEndOfFile: true,
    });

    return this;
  };

  public appendTypes = (
    models: CFContentType[],
    editorInterface?: CFEditorInterface,
  ): CFDefinitionsBuilder => {
    for (const model of models) {
      this.appendType(model, editorInterface);
    }

    return this;
  };

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
          case StructureKind.Function:
            mergeFile.addFunction(childStructure);
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
      const name = importD.moduleSpecifier.startsWith('./')
        ? importD.moduleSpecifier.slice(2)
        : importD.moduleSpecifier;
      // This check relies on the fact that module and file name match
      if (!types.includes(name) && !additionalFileNames.has(name)) {
        mergeFile.addImportDeclaration(importD);
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

    // this assumes all things are named exports
    // maybe use https://github.com/dsherret/ts-morph/issues/165#issuecomment-350522329
    for (const sourceFile of this.project.getSourceFiles()) {
      const exportDeclarations = sourceFile.getExportSymbols();
      if (sourceFile.getBaseNameWithoutExtension() !== 'index') {
        // we have to add every single exported member to differentiate type only exports
        // organize imports in the end optimize again and groups imports from same module
        for (const exportDeclaration of exportDeclarations) {
          indexFile.addExportDeclaration({
            isTypeOnly: !sourceFile.getFunctions().some((f) => {
              return f.getName() === exportDeclaration.getExportSymbol().getName();
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
