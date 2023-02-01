import { Field } from 'contentful';
import { linkContentTypeValidations } from '../../extract-validation';
import { renderTypeGeneric, renderTypeUnion } from '../generic';
import { RenderContext } from '../type';

export const renderPropLink = (
  field: Pick<Field, 'validations' | 'linkType'>,
  context: RenderContext,
): string => {
  const linkContentType = (field: Pick<Field, 'validations'>, context: RenderContext): string => {
    const validations = linkContentTypeValidations(field);
    return validations?.length > 0
      ? renderTypeUnion(validations.map((validation) => context.moduleFieldsName(validation)))
      : 'Record<string, any>';
  };

  switch (field.linkType) {
    case 'Entry':
      context.imports.add({
        moduleSpecifier: 'contentful',
        namedImports: ['Entry'],
      });
      return renderTypeGeneric(field.linkType, linkContentType(field, context));

    case 'Asset':
      context.imports.add({
        moduleSpecifier: 'contentful',
        namedImports: ['Asset'],
      });
      return 'Asset';

    default:
      throw new Error(`Unknown linkType "${field.linkType}"`);
  }
};
