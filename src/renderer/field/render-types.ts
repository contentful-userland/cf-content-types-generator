import { ContentTypeField, ContentTypeFieldType } from 'contentful';
import { RenderContext } from '../type';

export type FieldRenderer<FType extends ContentTypeFieldType> = (
  field: FType extends 'Link'
    ? Pick<ContentTypeField, 'validations' | 'linkType'>
    : ContentTypeField,
  context: RenderContext,
) => string;

export type FieldRenderers = {
  RichText: FieldRenderer<'RichText'>;
  Link: FieldRenderer<'Link'>;
  ResourceLink: FieldRenderer<'ResourceLink'>;
  Array: FieldRenderer<'Array'>;
  Text: FieldRenderer<'Text'>;
  Symbol: FieldRenderer<'Symbol'>;
  Object: FieldRenderer<'Object'>;
  Date: FieldRenderer<'Date'>;
  Number: FieldRenderer<'Number'>;
  Integer: FieldRenderer<'Integer'>;
  Boolean: FieldRenderer<'Boolean'>;
  Location: FieldRenderer<'Location'>;
};
