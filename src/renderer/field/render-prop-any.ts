import { ContentTypeField } from 'contentful';
import { renderTypeGeneric, renderTypeLiteral, renderTypeUnion } from '../generic';
import { RenderContext } from '../type';

export const renderPropAny = (field: ContentTypeField, context: RenderContext): string => {
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

export const renderPropAnyV10 = (field: ContentTypeField, context: RenderContext): string => {
  context.imports.add({
    moduleSpecifier: 'contentful',
    namedImports: ['EntryFieldTypes'],
    isTypeOnly: true,
  });

  if (field.validations?.length > 0) {
    const includesValidation = field.validations.find((validation) => validation.in);
    if (includesValidation && includesValidation.in) {
      const mapper = (): ((value: string) => string) => {
        if (field.type === 'Symbol' || field.type === 'Text' || field.type === 'RichText') {
          return renderTypeLiteral;
        }

        return (value: string) => value.toString();
      };

      return renderTypeGeneric(
        `EntryFieldTypes.${field.type}`,
        renderTypeUnion(includesValidation.in.map((type) => mapper()(type))),
      );
    }
  }

  return `EntryFieldTypes.${field.type}`;
};
