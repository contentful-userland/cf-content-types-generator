import { renderPropAnyV10 } from './render-prop-any';
import { renderPropArrayV10 } from './render-prop-array';
import { renderPropLinkV10 } from './render-prop-link';
import { renderPropResourceLinkV10 } from './render-prop-resource-link';
import { renderRichTextV10 } from './render-prop-richtext';
import { FieldRenderers } from './render-types';

export const v10Renderers: FieldRenderers = {
  RichText: renderRichTextV10,
  Link: renderPropLinkV10,
  ResourceLink: renderPropResourceLinkV10,
  Array: renderPropArrayV10,
  Text: renderPropAnyV10,
  Symbol: renderPropAnyV10,
  Object: renderPropAnyV10,
  Date: renderPropAnyV10,
  Number: renderPropAnyV10,
  Integer: renderPropAnyV10,
  Boolean: renderPropAnyV10,
  Location: renderPropAnyV10,
};
