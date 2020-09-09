import {Field} from 'contentful';
import {renderPropLink} from './cf-render-prop-link';
import {renderUnionType} from './render-union-type';
import {renderLiteralType} from './render-literal-type';
import {inValidations} from '../utils';

export const renderPropArray = (field: Field): string => {
    if (!field.items) {
        throw new Error(`missing items for ${field.id}`);
    }

    if (field.items.type === 'Link') {
        return renderPropLink({...field.items, ...{id: field.id}}) + '[]';
    }

    if (field.items.type === 'Symbol') {
        const validation = inValidations(field.items);

        if (validation?.length > 0) {
            return `(${renderUnionType(validation.map(renderLiteralType))})[]`;
        }
        return 'Contentful.EntryFields.Symbol[]';
    }

    throw new Error('unhandled array type "' + field.items.type + '"');
};
