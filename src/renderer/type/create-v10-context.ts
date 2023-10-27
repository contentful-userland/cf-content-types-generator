import { ContentTypeFieldType } from 'contentful';
import { FieldRenderer, v10Renderers } from '../field';
import {
  createDefaultContext,
  RenderContext,
  RenderContextOptions,
} from './create-default-context';
import { moduleSkeletonName } from '../../module-name';

export const createV10Context = (options: RenderContextOptions = {}): RenderContext => {
  return {
    ...createDefaultContext(options),
    moduleReferenceName: moduleSkeletonName,
    getFieldRenderer: <FType extends ContentTypeFieldType>(fieldType: FType) =>
      v10Renderers[fieldType] as FieldRenderer<FType>,
  };
};
