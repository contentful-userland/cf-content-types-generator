import {FieldType} from 'contentful';
import {defaultRenderers, FieldRenderer, RenderContext} from '.';
import {moduleFieldsName, moduleName} from '../utils';

export const createDefaultContext = (): RenderContext => {
    return {
        moduleName,
        moduleFieldsName,
        getRenderer: <FType extends FieldType>(fieldType: FType) => defaultRenderers[fieldType] as FieldRenderer<FType>,
        imports: new Set(),
    };
};
