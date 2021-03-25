import {renderRichText, renderPropLink, renderPropArray} from '../type-renderer';
import {renderPropAny} from '../type-renderer/cf-render-prop-any';

export type FieldRenderers = {
    RichText: typeof renderRichText;
    Link: typeof renderPropLink;
    Array: typeof renderPropArray;
    Text: typeof renderPropAny;
    Symbol: typeof renderPropAny;
    Object: typeof renderPropAny;
    Date: typeof renderPropAny;
    Number: typeof renderPropAny;
    Integer: typeof renderPropAny;
    Boolean: typeof renderPropAny;
    Location: typeof renderPropAny;
};
