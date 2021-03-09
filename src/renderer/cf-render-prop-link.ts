import {Field} from 'contentful';
import {renderTypeGeneric} from './render-type-generic';
import {linkContentTypeValidations, moduleFieldsName} from '../utils';
import {renderTypeUnion} from './render-type-union';

const linkContentType = (field: Pick<Field, 'validations'>): string => {
    const validations = linkContentTypeValidations(field);
    return validations?.length > 0
        ? renderTypeUnion(validations.map(validation => moduleFieldsName(validation)))
        : 'Record<string, any>';
};

export const renderPropLink = (field: Pick<Field, 'validations' | 'linkType'>) => {
    return field.linkType === 'Entry'
        ? renderTypeGeneric('Contentful.' + field.linkType, linkContentType(field))
        : 'Contentful.' + field.linkType!;
};
