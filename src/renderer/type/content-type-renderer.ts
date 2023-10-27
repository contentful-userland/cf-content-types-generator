import { Project, SourceFile } from 'ts-morph';
import { CFContentType, CFEditorInterface } from '../../types';
import { RenderContext, RenderContextOptions } from './create-default-context';

export interface ContentTypeRenderer {
  setup(project: Project): void;

  render(
    contentType: CFContentType,
    file: SourceFile,
    editorInterface?: CFEditorInterface,
    contextOptions?: RenderContextOptions,
  ): void;

  createContext(options?: RenderContextOptions): RenderContext;

  additionalFiles(): SourceFile[];
}
