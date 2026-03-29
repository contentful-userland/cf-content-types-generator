import { ContentTypeField } from 'contentful';
import { RenderContext } from '../type';

export const renderRichText = (field: ContentTypeField, context: RenderContext): string => {
  context.imports.add({
    moduleSpecifier: 'contentful',
    namedImports: ['EntryFieldTypes'],
    isTypeOnly: true,
  });

  return 'EntryFieldTypes.RichText';
};
