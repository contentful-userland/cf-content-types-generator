import { ContentTypeField } from 'contentful';
import { linkContentTypeValidations } from '../../extract-validation';
import { renderTypeGeneric, renderTypeUnion } from '../generic';
import { RenderContext } from '../type';

export const renderPropLink = (
  field: Pick<ContentTypeField, 'validations' | 'linkType'>,
  context: RenderContext,
): string => {
  const linkContentType = (
    field: Pick<ContentTypeField, 'validations'>,
    context: RenderContext,
  ): string => {
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
        isTypeOnly: true,
      });
      return renderTypeGeneric(field.linkType, linkContentType(field, context));

    case 'Asset':
      context.imports.add({
        moduleSpecifier: 'contentful',
        namedImports: ['Asset'],
        isTypeOnly: true,
      });
      return 'Asset';

    default:
      throw new Error(`Unknown linkType "${field.linkType}"`);
  }
};
