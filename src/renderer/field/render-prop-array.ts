import { Field } from 'contentful';
import { inValidations } from '../../extract-validation';
import { renderTypeArray, renderTypeLiteral, renderTypeUnion } from '../generic';
import { RenderContext } from '../type';

export const renderPropArray = (field: Field, context: RenderContext): string => {
  if (!field.items) {
    throw new Error(`missing items for ${field.id}`);
  }

  if (field.items.type === 'Link') {
    return renderTypeArray(context.getFieldRenderer('Link')(field.items, context));
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

    return renderTypeArray('Contentful.EntryFields.Symbol');
  }

  throw new Error('unhandled array type "' + field.items.type + '"');
};
