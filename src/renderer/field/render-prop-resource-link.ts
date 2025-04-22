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

const EntryResourceType = renderTypeGeneric('EntryFieldTypes.EntryResourceLink', 'EntrySkeletonType');
const ExternalResourceType = 'EntryFieldTypes.ExternalResourceLink';

export const renderPropResourceLinkV10 = (
  field: ContentTypeField,
  context: RenderContext,
): string => {
  const resourceTypes = new Set() as Set<string>;
  for (const resource of field.allowedResources!) {
    if (resource.type !== 'Contentful:Entry') {
      if (resource.source) {
        // We have a cross-space reference that's not to an Entry, throw an error
        throw new Error(`Unknown type "${resource.type}"`);
      }

      // Handle native external references
      console.log(`Unknown external (?) resource link type "${resource.type}"`);
      if (!resourceTypes.has(ExternalResourceType)) {
        context.imports.add({
            moduleSpecifier: 'contentful',
            namedImports: ['EntryFieldTypes', 'ExternalResourceLink'],
            isTypeOnly: true,
        });
        resourceTypes.add(ExternalResourceType);
      }
    } else if (!resourceTypes.has(EntryResourceType)) {
      context.imports.add({
        moduleSpecifier: 'contentful',
        namedImports: ['EntryFieldTypes', 'EntrySkeletonType'],
        isTypeOnly: true,
      });
      resourceTypes.add(EntryResourceType);
    }
  }

  return [...resourceTypes].join(" | ");
};
