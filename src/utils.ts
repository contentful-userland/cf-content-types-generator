import {FieldItem, FieldValidation, Field} from 'contentful';
import {upperFirst} from 'lodash';
import {pipe} from 'lodash/fp';

export const moduleName = (name: string): string => {
    const removeSpace = (input: string): string => input.replace(/\s/g, '');
    const replaceDash = (input: string): string => input.replace(/-/g, '__');
    const addPrefix = (input: string): string => input.startsWith('Type') ? input : `Type${input}`;
    return pipe([replaceDash, upperFirst, addPrefix, removeSpace])(name);
};

export const moduleFieldsName = (name: string): string => moduleName(name) + 'Fields';

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

const filterValidation = (validation: FieldValidation, modName: string) => ({
    ...validation,
    linkContentType: validation.linkContentType?.filter(link => moduleName(link) !== modName),
});

export const filterSelfReference = (field: Field, modName: string): Field => ({
    ...field,
    items: field.items && {
        ...field.items,
        validations: field.items.validations.map(val => filterValidation(val, modName)),
    },
    validations: field.validations.map(val => filterValidation(val, modName)),
});

export const linkContentTypeValidations = (node: WithValidations): string[] => validation(node, 'linkContentType');
export const inValidations = (node: WithValidations): string[] => validation(node, 'in');
