import {Field} from 'contentful';

export type FieldRenderer = (field: Field) => string;

export type FieldRenderers = {
    RichText: FieldRenderer;
    Link: (field: Pick<Field, 'validations' | 'linkType'>) => string;
    Array: FieldRenderer;
    Text: FieldRenderer;
    Symbol: FieldRenderer;
    Object: FieldRenderer;
    Date: FieldRenderer;
    Number: FieldRenderer;
    Integer: FieldRenderer;
    Boolean: FieldRenderer;
    Location: FieldRenderer;
};
