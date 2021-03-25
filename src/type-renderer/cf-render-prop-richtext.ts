import {renderTypeUnion} from '../renderer';

export const renderRichText = (): string => {
    return renderTypeUnion(['CFRichTextTypes.Block', 'CFRichTextTypes.Inline']);
};
