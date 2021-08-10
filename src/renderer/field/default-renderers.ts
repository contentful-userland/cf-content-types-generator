import {renderPropAny} from './render-prop-any';
import {renderPropArray} from './render-prop-array';
import {renderPropLink} from './render-prop-link';
import {renderRichText} from './render-prop-richtext';
import {FieldRenderers} from './render-types';

export const defaultRenderers: FieldRenderers = {
    RichText: renderRichText,
    Link: renderPropLink,
    Array: renderPropArray,
    Text: renderPropAny,
    Symbol: renderPropAny,
    Object: renderPropAny,
    Date: renderPropAny,
    Number: renderPropAny,
    Integer: renderPropAny,
    Boolean: renderPropAny,
    Location: renderPropAny,
};
