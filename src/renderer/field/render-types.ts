import {Field, FieldType} from 'contentful';
import {RenderContext} from '../type';

export type FieldRenderer<FType extends FieldType> = (
    field: FType extends 'Link'
        ? Pick<Field, 'validations' | 'linkType'>
        : Field,
    context: RenderContext) => string;

export type FieldRenderers = {
    RichText: FieldRenderer<'RichText'>;
    Link: FieldRenderer<'Link'>;
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
