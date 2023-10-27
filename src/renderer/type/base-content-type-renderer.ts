import { Project, SourceFile } from 'ts-morph';
import { CFContentType, CFEditorInterface } from '../../types';
import { ContentTypeRenderer } from './content-type-renderer';
import {
  createDefaultContext,
  RenderContext,
  RenderContextOptions,
} from './create-default-context';

export class BaseContentTypeRenderer implements ContentTypeRenderer {
  setup(project: Project): void {
    /**/
  }

  public render(
    contentType: CFContentType,
    file: SourceFile,
    editorInterface?: CFEditorInterface,
    contextOptions: RenderContextOptions = {},
  ): void {
    file.addStatements(`/* Types for ${contentType.sys.id} */`);
  }

  public createContext(options: RenderContextOptions = {}): RenderContext {
    return createDefaultContext(options);
  }

  additionalFiles(): SourceFile[] {
    return [];
  }
}
