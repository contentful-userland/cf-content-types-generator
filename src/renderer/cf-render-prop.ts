import {Field} from 'contentful';
import {renderUnionType} from './render-union-type';
import {renderPropLink} from './cf-render-prop-link';
import {renderPropArray} from './cf-render-prop-array';
import {anyType} from '../cf-property-types';

export const renderProp = (field: Field): string => {
    switch (field.type) {
    case 'RichText':
        return renderUnionType(['CFRichTextTypes.Block', 'CFRichTextTypes.Inline']);
    case 'Link':
        return renderPropLink(field);
    case 'Array':
        return renderPropArray(field);
    default:
        return anyType(field);
    }
};
