import { Project, SourceFile } from 'ts-morph';
import { CFContentType, CFEditorInterface } from '../../types';
import { RenderContext } from './create-context';

export interface Renderer {
  setup(project: Project): void;

  render(contentType: CFContentType, file: SourceFile, editorInterface?: CFEditorInterface): void;

  createContext(): RenderContext;

  additionalFiles(): SourceFile[];
}
