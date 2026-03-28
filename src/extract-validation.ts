import { FieldItem, ContentTypeFieldValidation } from 'contentful';

type WithValidations = Pick<FieldItem, 'validations'>;

const validation = <T extends keyof ContentTypeFieldValidation>(
  node: WithValidations,
  field: T,
): NonNullable<ContentTypeFieldValidation[T]> | [] => {
  if (node.validations && node.validations.length > 0) {
    const linkContentValidation = node.validations.find((value) => value[field]);
    if (linkContentValidation) {
      return (linkContentValidation[field] ?? []) as
        | NonNullable<ContentTypeFieldValidation[T]>
        | [];
    }
  }

  return [];
};

export const linkContentTypeValidations = (node: WithValidations): string[] => {
  const value = validation(node, 'linkContentType');
  return Array.isArray(value) ? value : [value];
};

export const inValidations = (node: WithValidations): string[] => {
  return validation(node, 'in');
};
