import { Project, SourceFile } from 'ts-morph';
import { CFContentType } from '../../types';
import { ContentTypeRenderer } from './content-type-renderer';
import { createDefaultContext, RenderContext } from './create-default-context';

export class BaseContentTypeRenderer implements ContentTypeRenderer {
  setup(project: Project): void {
    /**/
  }

  public render(contentType: CFContentType, file: SourceFile): void {
    file.addStatements(`/* Types for ${contentType.sys.id} */`);
  }

  public createContext(): RenderContext {
    return createDefaultContext();
  }

  additionalFiles(): SourceFile[] {
    return [];
  }
}
