import {Field} from 'contentful';
import {renderPropLink} from './cf-render-prop-link';
import {inValidations} from '../utils';
import {renderTypeArray, renderTypeLiteral, renderTypeUnion} from '../renderer';

export const renderPropArray = (field: Field): string => {
    if (!field.items) {
        throw new Error(`missing items for ${field.id}`);
    }

    if (field.items.type === 'Link') {
        return renderTypeArray(renderPropLink(field.items));
    }

    if (field.items.type === 'Symbol') {
        const validation = inValidations(field.items);

        if (validation?.length > 0) {
            return renderTypeArray(`(${renderTypeUnion(validation.map(renderTypeLiteral))})`);
        }
        return renderTypeArray('Contentful.EntryFields.Symbol');
    }

    throw new Error('unhandled array type "' + field.items.type + '"');
};
