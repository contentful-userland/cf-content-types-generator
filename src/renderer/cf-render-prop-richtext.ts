import {Field} from 'contentful';
import {renderTypeUnion} from './render-type-union';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const renderRichText = (field: Field): string => {
    return renderTypeUnion(['CFRichTextTypes.Block', 'CFRichTextTypes.Inline']);
};
