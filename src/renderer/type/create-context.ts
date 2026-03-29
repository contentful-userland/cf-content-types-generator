import { ContentTypeFieldType } from 'contentful';
import { ImportDeclarationStructure, OptionalKind } from 'ts-morph';
import { moduleFieldsName, moduleName, moduleSkeletonName } from '../../module-name';
import { FieldRenderer, renderers } from '../field';

export type RenderContext = {
  getFieldRenderer: <FType extends ContentTypeFieldType>(fieldType: FType) => FieldRenderer<FType>;
  moduleName: (id: string) => string;
  moduleFieldsName: (id: string) => string;
  moduleReferenceName: (id: string) => string;
  moduleSkeletonName: (id: string) => string;
  imports: Set<OptionalKind<ImportDeclarationStructure>>;
};

export const createContext = (): RenderContext => {
  return {
    moduleName,
    moduleFieldsName,
    moduleSkeletonName,
    moduleReferenceName: moduleSkeletonName,
    getFieldRenderer: <FType extends ContentTypeFieldType>(fieldType: FType) =>
      renderers[fieldType] as FieldRenderer<FType>,
    imports: new Set(),
  };
};
