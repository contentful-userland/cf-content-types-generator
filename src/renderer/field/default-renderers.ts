import { renderPropAny } from './render-prop-any';
import { renderPropArray } from './render-prop-array';
import { renderPropLink } from './render-prop-link';
import { renderPropResourceLink } from './render-prop-resource-link';
import { renderRichText } from './render-prop-richtext';
import { FieldRenderers } from './render-types';

export const defaultRenderers: FieldRenderers = {
  RichText: renderRichText,
  Link: renderPropLink,
  ResourceLink: renderPropResourceLink,
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
