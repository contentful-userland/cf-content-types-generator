import { Project, SourceFile } from 'ts-morph';
import { CFContentType, CFEditorInterface } from '../../types';
import { RenderContext } from './create-default-context';

export interface ContentTypeRenderer {
  setup(project: Project): void;

  render(
    contentType: CFContentType,
    file: SourceFile,
    editorInterfaces?: CFEditorInterface[],
  ): void;

  createContext(): RenderContext;

  additionalFiles(): SourceFile[];
}
