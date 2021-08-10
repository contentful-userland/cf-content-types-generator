import {FieldType} from 'contentful';
import {ImportDeclarationStructure, OptionalKind} from 'ts-morph';
import {moduleFieldsName, moduleName} from '../../module-name';
import {defaultRenderers, FieldRenderer} from '../field';

export type RenderContext = {
    getFieldRenderer: <FType extends FieldType>(fieldType: FType) => FieldRenderer<FType>;
    moduleName: (id: string) => string;
    moduleFieldsName: (id: string) => string;
    imports: Set<OptionalKind<ImportDeclarationStructure>>;
}

export const createDefaultContext = (): RenderContext => {
    return {
        moduleName,
        moduleFieldsName,
        getFieldRenderer: <FType extends FieldType>(fieldType: FType) => defaultRenderers[fieldType] as FieldRenderer<FType>,
        imports: new Set(),
    };
};
