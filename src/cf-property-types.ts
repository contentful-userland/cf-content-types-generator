import {renderLiteralType} from './renderer/render-literal-type';
import {renderUnionType} from './renderer/render-union-type';
import {Field} from 'contentful';

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
                    return renderLiteralType;
                }
                return (value: string) => value.toString();
            };
            return renderUnionType(includesValidation.in!.map(mapper()));
        }
    }

    return `Contentful.EntryFields.${field.type}`;
};
