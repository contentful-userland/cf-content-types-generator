import { ContentTypeField } from 'contentful';
import { renderTypeGeneric } from '../generic';
import { RenderContext } from '../type';

export const renderPropResourceLink = (field: ContentTypeField, context: RenderContext): string => {
  for (const resource of field.allowedResources!) {
    if (resource.type !== 'Contentful:Entry') {
      throw new Error(`Unknown type "${resource.type}"`);
    }
  }

  context.imports.add({
    moduleSpecifier: 'contentful',
    namedImports: ['Entry'],
    isTypeOnly: true,
  });

  return renderTypeGeneric('Entry', 'Record<string, any>');
};

export const renderPropResourceLinkV10 = (
  field: ContentTypeField,
  context: RenderContext,
): string => {
  for (const resource of field.allowedResources!) {
    if (resource.type !== 'Contentful:Entry') {
      throw new Error(`Unknown type "${resource.type}"`);
    }
  }

  context.imports.add({
    moduleSpecifier: 'contentful',
    namedImports: ['EntryFieldTypes', 'EntrySkeletonType'],
    isTypeOnly: true,
  });

  return renderTypeGeneric('EntryFieldTypes.EntryResourceLink', 'EntrySkeletonType');
};
