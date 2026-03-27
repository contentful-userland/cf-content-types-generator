import { Project, SourceFile } from 'ts-morph';
import { CFContentType } from '../../types';
import { Renderer } from './renderer';
import { createContext, RenderContext } from './create-context';

export class BaseContentTypeRenderer implements Renderer {
  setup(project: Project): void {
    /**/
  }

  public render(contentType: CFContentType, file: SourceFile): void {
    file.addStatements(`/* Types for ${contentType.sys.id} */`);
  }

  public createContext(): RenderContext {
    return createContext();
  }

  additionalFiles(): SourceFile[] {
    return [];
  }
}
