import {Field} from 'contentful';
import {renderGenericType} from './render-generic-type';
import {linkContentTypeValidations, moduleFieldsName} from '../utils';
import {renderUnionType} from './render-union-type';

const linkContentType = (field: Pick<Field, 'id' | 'validations'>): string => {
    const validations = linkContentTypeValidations(field);
    return validations?.length > 0 ? renderUnionType(validations.map(moduleFieldsName)) : 'Record<string, any>';
};

export const renderPropLink = (field: Pick<Field, 'id' | 'validations' | 'linkType'>) => {
    return field.linkType === 'Entry'
        ? renderGenericType('Contentful.' + field.linkType, linkContentType(field))
        : 'Contentful.' + field.linkType!;
};
