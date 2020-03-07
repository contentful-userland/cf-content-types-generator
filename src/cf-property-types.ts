import {Field} from 'contentful';
import {stringType, generic, moduleFieldsName, unionType, linkContentTypeValidations, inValidations} from './utils';

export const linkContentType = (field: Pick<Field, 'id' | 'validations'>): string => {
    const validations = linkContentTypeValidations(field);
    return unionType(validations.length > 0 ? validations.map(moduleFieldsName) : ['any']);
};

export const linkType = (field: Pick<Field, 'id' | 'validations' | 'linkType'>) => {
    const value = field.validations.length === 0 ? 'any' : linkContentType(field);
    return field.linkType === 'Entry'
        ? generic('Contentful.' + field.linkType, value)
        : 'Contentful.' + field.linkType!;
};

export const arrayType = (field: Field): string => {
    if (!field.items) {
        throw new Error(`missing items for ${field.id}`);
    }

    if (field.items.type === 'Link') {
        return linkType({...field.items, ...{id: field.id}}) + '[]';
    }

    if (field.items.type === 'Symbol') {
        const validation = inValidations(field.items);

        if (validation.length > 0) {
            return `(${unionType(validation.map(stringType))})[]`;
        }
        return 'Contentful.EntryFields.Symbol[]';
    }

    throw new Error('unhandled array type "' + field.items.type + '"');
};

export const anyType = (field: Field): string => {
    if (field.validations.length > 0) {
        const includesValidation = field.validations.find(validation => validation.in);
        if (includesValidation && includesValidation.in!.length > 0) {
            const mapper = (): (value: string) => string => {
                if (
                    field.type === 'Symbol' ||
                    field.type === 'Text' ||
                    field.type === 'RichText'
                ) {
                    return stringType;
                }
                return (value: string) => value.toString();
            };
            return unionType(includesValidation.in!.map(mapper()));
        }
    }

    return `Contentful.EntryFields.${field.type}`;
};

export const propertyType = (field: Field): string => {
    switch (field.type) {
    case 'RichText':
        return unionType(['CFRichTextTypes.Block', 'CFRichTextTypes.Inline']);
    case 'Link':
        return linkType(field);
    case 'Array':
        return arrayType(field);
    default:
        return anyType(field);
    }
};

