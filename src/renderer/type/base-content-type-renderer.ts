import {Project, SourceFile} from 'ts-morph';
import {CFContentType} from '../../types';
import {ContentTypeRenderer} from './content-type-renderer';
import {createDefaultContext, RenderContext} from './create-default-context';

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
