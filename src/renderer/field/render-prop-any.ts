import { Field } from 'contentful';
import { renderTypeLiteral, renderTypeUnion } from '../generic';
import { RenderContext } from '../type';

export const renderPropAny = (field: Field, context: RenderContext): string => {
  if (field.validations?.length > 0) {
    const includesValidation = field.validations.find((validation) => validation.in);
    if (includesValidation && includesValidation.in) {
      const mapper = (): ((value: string) => string) => {
        if (field.type === 'Symbol' || field.type === 'Text' || field.type === 'RichText') {
          return renderTypeLiteral;
        }

        return (value: string) => value.toString();
      };

      return renderTypeUnion(includesValidation.in.map((type) => mapper()(type)));
    }
  }

  context.imports.add({
    moduleSpecifier: 'contentful',
    namedImports: ['EntryFields'],
    isTypeOnly: true,
  });

  return `EntryFields.${field.type}`;
};
