import { Field } from 'contentful';
import { RenderContext } from '../type';

export const renderRichText = (field: Field, context: RenderContext): string => {
  context.imports.add({
    moduleSpecifier: 'contentful',
    namedImports: ['EntryFields'],
    isTypeOnly: true,
  });
  return 'EntryFields.RichText';
};
