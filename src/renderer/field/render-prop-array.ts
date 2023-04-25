import { ContentTypeField } from 'contentful';
import { inValidations } from '../../extract-validation';
import { renderTypeArray, renderTypeGeneric, renderTypeLiteral, renderTypeUnion } from '../generic';
import { RenderContext } from '../type';

export const renderPropArray = (field: ContentTypeField, context: RenderContext): string => {
  if (!field.items) {
    throw new Error(`missing items for ${field.id}`);
  }

  if (field.items.type === 'Link') {
    return renderTypeArray(context.getFieldRenderer('Link')(field.items, context));
  }

  if (field.items.type === 'ResourceLink') {
    return renderTypeArray(context.getFieldRenderer('ResourceLink')(field, context));
  }

  if (field.items.type === 'Symbol') {
    const validation = inValidations(field.items);

    if (validation?.length > 0) {
      const validationsTypes = validation.map((val: string) => renderTypeLiteral(val));

      if (validationsTypes.length > 1) {
        return renderTypeArray(`(${renderTypeUnion(validationsTypes)})`);
      }

      return renderTypeArray(`${renderTypeUnion(validationsTypes)}`);
    }

    context.imports.add({
      moduleSpecifier: 'contentful',
      namedImports: ['EntryFields'],
      isTypeOnly: true,
    });

    return renderTypeArray('EntryFields.Symbol');
  }

  throw new Error('unhandled array type "' + field.items.type + '"');
};

export const renderPropArrayV10 = (field: ContentTypeField, context: RenderContext): string => {
  if (!field.items) {
    throw new Error(`missing items for ${field.id}`);
  }

  context.imports.add({
    moduleSpecifier: 'contentful',
    namedImports: ['EntryFieldTypes'],
    isTypeOnly: true,
  });

  if (field.items.type === 'Link') {
    return renderTypeGeneric(
      'EntryFieldTypes.Array',
      context.getFieldRenderer('Link')(field.items, context),
    );
  }

  if (field.items.type === 'ResourceLink') {
    return renderTypeGeneric(
      'EntryFieldTypes.Array',
      context.getFieldRenderer('ResourceLink')(field, context),
    );
  }

  if (field.items.type === 'Symbol') {
    const validation = inValidations(field.items);

    if (validation?.length > 0) {
      const validationsTypes = validation.map((val: string) => renderTypeLiteral(val));

      return renderTypeGeneric(
        'EntryFieldTypes.Array',
        renderTypeGeneric('EntryFieldTypes.Symbol', renderTypeUnion(validationsTypes)),
      );
    }

    return renderTypeGeneric('EntryFieldTypes.Array', 'EntryFieldTypes.Symbol');
  }

  throw new Error('unhandled array type "' + field.items.type + '"');
};
