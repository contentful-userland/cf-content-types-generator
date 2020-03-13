import {Field} from 'contentful';
import {renderGenericType} from './render-generic-type';
import {linkContentTypeValidations, moduleFieldsName} from '../utils';
import {renderUnionType} from './render-union-type';

const linkContentType = (field: Pick<Field, 'id' | 'validations'>): string => {
    const validations = linkContentTypeValidations(field);
    return renderUnionType(validations.length > 0 ? validations.map(moduleFieldsName) : ['any']);
};

export const renderPropLink = (field: Pick<Field, 'id' | 'validations' | 'linkType'>) => {
    const value = field.validations.length === 0 ? 'any' : linkContentType(field);
    return field.linkType === 'Entry'
        ? renderGenericType('Contentful.' + field.linkType, value)
        : 'Contentful.' + field.linkType!;
};
