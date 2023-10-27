import { ContentTypeFieldType } from 'contentful';
import { ImportDeclarationStructure, OptionalKind } from 'ts-morph';
import { moduleFieldsName, moduleName, moduleSkeletonName } from '../../module-name';
import { defaultRenderers, FieldRenderer } from '../field';

export type RenderContextOptions = {
  genericsPrefix?: string;
};

export type RenderContext = {
  getFieldRenderer: <FType extends ContentTypeFieldType>(fieldType: FType) => FieldRenderer<FType>;
  moduleName: (id: string) => string;
  moduleFieldsName: (id: string) => string;
  moduleReferenceName: (id: string) => string;
  moduleSkeletonName: (id: string) => string;
  imports: Set<OptionalKind<ImportDeclarationStructure>>;
  genericsPrefix?: string;
};

export const createDefaultContext = ({
  genericsPrefix = '',
}: RenderContextOptions = {}): RenderContext => {
  return {
    moduleName,
    moduleFieldsName,
    moduleSkeletonName,
    moduleReferenceName: moduleFieldsName,
    getFieldRenderer: <FType extends ContentTypeFieldType>(fieldType: FType) =>
      defaultRenderers[fieldType] as FieldRenderer<FType>,
    imports: new Set(),
    genericsPrefix,
  };
};
