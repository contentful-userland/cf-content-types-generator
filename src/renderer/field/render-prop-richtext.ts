import { Field } from 'contentful';
import { renderTypeUnion } from '../generic';
import { RenderContext } from '../type';

export const renderRichText = (field: Field, context: RenderContext): string => {
  context.imports.add({
    moduleSpecifier: '@contentful/rich-text-types',
    namespaceImport: 'CFRichTextTypes',
    isTypeOnly: true,
  });
  return renderTypeUnion(['CFRichTextTypes.Block', 'CFRichTextTypes.Inline']);
};
