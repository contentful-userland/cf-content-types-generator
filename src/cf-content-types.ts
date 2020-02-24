import {Field} from 'contentful';
import {asString, generic, typeName, unionType} from './util';

export const linkContentType = (field: Pick<Field, 'id' | 'validations'>): string => {
    if (field.validations.length === 0) {
        throw new Error(`missing validation info for ${field.id}`);
    }
    const firstValidation = field.validations[0];

    if (firstValidation.linkContentType?.length === 0) {
        throw new Error(`missing content type info for ${field.id}`);
    }

    return unionType(firstValidation!.linkContentType!.map(typeName));
};

export const linkType = (field: Pick<Field, 'id' | 'validations' | 'linkType'>) => {
    return field.linkType === 'Entry'
        ? generic('Contentful.' + field.linkType, typeName(linkContentType(field)))
        : 'Contentful.' + field.linkType!;
};

export const arrayType = (field: Field): string => {
    if (!field.items || field.items.validations.length === 0) {
        throw new Error(`missing items validation info for ${field.id}`);
    }

    if (field.items.type === 'Link') {
        return linkType({...field.items, ...{id: field.id}}) + '[]';
    }
    // what should it be?
    return linkType({...field.items, ...{id: field.id}}) + '[]';
};

export const literalType = (field: Field): string => {
    if (field.validations.length > 0) {
        const includesValidation = field.validations.find(validation => validation.in);
        if (includesValidation && includesValidation.in!.length > 0) {
            const mapper = (): (value: string) => string => {
                if (
                    field.type === 'Symbol' ||
                    field.type === 'Text' ||
                    field.type === 'RichText'
                ) {
                    return asString;
                }
                return (value: string) => value.toString();
            };
            return unionType(includesValidation.in!.map(mapper()));
        }
    }

    return `Contentful.EntryFields.${field.type}`;
};
