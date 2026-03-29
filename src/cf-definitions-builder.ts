import { Project, ScriptTarget, SourceFile } from 'ts-morph';
import { moduleName } from './module-name';
import { ContentTypeRenderer, Renderer } from './renderer';
import { CFContentType, CFEditorInterface, WriteCallback } from './types';
import { DefinitionsOutputWriter } from './internal/write-output';

export default class CFDefinitionsBuilder {
  private readonly project: Project;

  private readonly contentTypeRenderers: Renderer[];

  private readonly outputWriter: DefinitionsOutputWriter;

  constructor(contentTypeRenderers: Renderer[] = []) {
    if (contentTypeRenderers.length === 0) {
      contentTypeRenderers.push(new ContentTypeRenderer());
    }

    this.contentTypeRenderers = contentTypeRenderers;
    this.project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        target: ScriptTarget.ES5,
        declaration: true,
      },
    });

    for (const renderer of this.contentTypeRenderers) {
      renderer.setup(this.project);
    }

    this.outputWriter = new DefinitionsOutputWriter(this.project, this.contentTypeRenderers);
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
      renderer.render(model, file, editorInterface);
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
    await this.outputWriter.write(dir, writeCallback);
  };

  public toString = (): string => {
    return this.outputWriter.toString();
  };

  private addFile = (name: string): SourceFile => {
    return this.project.createSourceFile(`${name}.ts`, undefined, {
      overwrite: true,
    });
  };
}
