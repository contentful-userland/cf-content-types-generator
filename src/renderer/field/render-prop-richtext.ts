import { ContentTypeField } from 'contentful';
import { RenderContext } from '../type';

export const renderRichText = (field: ContentTypeField, context: RenderContext): string => {
  context.imports.add({
    moduleSpecifier: 'contentful',
    namedImports: ['EntryFields'],
    isTypeOnly: true,
  });
  return 'EntryFields.RichText';
};

export const renderRichTextV10 = (field: ContentTypeField, context: RenderContext): string => {
  context.imports.add({
    moduleSpecifier: 'contentful',
    namedImports: ['EntryFieldTypes'],
    isTypeOnly: true,
  });

  return 'EntryFieldTypes.RichText';
};
