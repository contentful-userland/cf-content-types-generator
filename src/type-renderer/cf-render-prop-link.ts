import {Field} from 'contentful';
import {renderTypeGeneric, renderTypeUnion} from '../renderer';
import {RenderContext} from './render-types';
import {linkContentTypeValidations} from '../utils';

const linkContentType = (field: Pick<Field, 'validations'>, context: RenderContext): string => {
    const validations = linkContentTypeValidations(field);
    return validations?.length > 0
        ? renderTypeUnion(validations.map(validation => context.moduleFieldsName(validation)))
        : 'Record<string, any>';
};

export const renderPropLink = (field: Pick<Field, 'validations' | 'linkType'>, context: RenderContext) => {
    return field.linkType === 'Entry'
        ? renderTypeGeneric('Contentful.' + field.linkType, linkContentType(field, context))
        : 'Contentful.' + field.linkType!;
};
