import {FieldItem, FieldValidation} from 'contentful';

export const moduleName = (name: string): string => name.charAt(0).toUpperCase() + name.slice(1);

export const moduleFieldsName = (name: string): string => moduleName(name) + 'Fields';

export const generic = (type: string, gen: string): string => `${type}<${gen}>`;

export const unionType = (types: string[]): string => types.join(' | ');

export const stringType = (value: string): string => `"${value}"`;

type WithValidations = Pick<FieldItem, 'validations'>;

const validation = (node: WithValidations, field: keyof FieldValidation): any => {
    if (node.validations.length !== 0) {
        const linkContentValidation = node.validations.find(value => value[field]);
        if (linkContentValidation) {
            return linkContentValidation[field] || [];
        }
    }
    return [];
};

export const linkContentTypeValidations = (node: WithValidations): string[] => validation(node, 'linkContentType');
export const inValidations = (node: WithValidations): string[] => validation(node, 'in');
