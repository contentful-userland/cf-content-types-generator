import {Project, SourceFile} from 'ts-morph';
import {CFContentType} from '../types';
import {createDefaultContext} from './create-default-context';
import {ContentTypeRenderer, RenderContext} from './render-types';

export class BaseContentTypeRenderer implements ContentTypeRenderer {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
    setup(project: Project): void {
    }

    public render(contentType: CFContentType, file: SourceFile): void {
        file.addStatements(`/* Types for ${contentType.sys.id} */`);
    }

    public createContext(): RenderContext {
        return createDefaultContext();
    }
}
