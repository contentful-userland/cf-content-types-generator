import { ContentTypeFieldType } from 'contentful';
import { ImportDeclarationStructure, OptionalKind } from 'ts-morph';
import { FieldRenderer, v10Renderers } from '../field';
import { createDefaultContext } from './create-default-context';
import { moduleSkeletonName } from '../../module-name';

export type RenderContext = {
  getFieldRenderer: <FType extends ContentTypeFieldType>(fieldType: FType) => FieldRenderer<FType>;
  moduleName: (id: string) => string;
  moduleFieldsName: (id: string) => string;
  moduleReferenceName: (id: string) => string;
  moduleSkeletonName: (id: string) => string;
  imports: Set<OptionalKind<ImportDeclarationStructure>>;
};

export const createV10Context = (): RenderContext => {
  return {
    ...createDefaultContext(),
    moduleReferenceName: moduleSkeletonName,
    getFieldRenderer: <FType extends ContentTypeFieldType>(fieldType: FType) =>
      v10Renderers[fieldType] as FieldRenderer<FType>,
  };
};
