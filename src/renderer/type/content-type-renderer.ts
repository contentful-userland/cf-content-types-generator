import {Project, SourceFile} from 'ts-morph';
import {CFContentType} from '../../types';
import {RenderContext} from './create-default-context';

export interface ContentTypeRenderer {

    setup(project: Project): void;

    render(contentType: CFContentType, file: SourceFile): void;

    createContext(): RenderContext;

    additionalFiles(): SourceFile[];
}
