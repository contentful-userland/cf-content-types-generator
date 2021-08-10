import {Field} from 'contentful';
import {linkContentTypeValidations} from '../../extract-validation';
import {renderTypeGeneric, renderTypeUnion} from '../generic';
import {RenderContext} from '../type';

export const renderPropLink = (field: Pick<Field, 'validations' | 'linkType'>, context: RenderContext) => {
    const linkContentType = (field: Pick<Field, 'validations'>, context: RenderContext): string => {
        const validations = linkContentTypeValidations(field);
        return validations?.length > 0
            ? renderTypeUnion(validations.map(validation => context.moduleFieldsName(validation)))
            : 'Record<string, any>';
    };

    return field.linkType === 'Entry'
        ? renderTypeGeneric('Contentful.' + field.linkType, linkContentType(field, context))
        : 'Contentful.' + field.linkType!;
};
