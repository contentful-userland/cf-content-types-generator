import {Field} from 'contentful';
import {ImportDeclarationStructure, OptionalKind} from 'ts-morph';
import {linkContentTypeValidations, typeName, typeNameWithFields} from './utils';

export const typeImports = (field: Field): OptionalKind<ImportDeclarationStructure>[] => {
    if (field.type === 'Link' && field.linkType === 'Entry') {
        return linkContentTypeValidations(field).map(item => ({
            moduleSpecifier: `./${typeName(item)}`,
            namedImports: [
                typeNameWithFields(item),
            ],
        }));
    }
    if (field.type === 'Array' && field.items) {
        return linkContentTypeValidations(field.items).map(item => ({
            moduleSpecifier: `./${typeName(item)}`,
            namedImports: [
                typeNameWithFields(item),
            ],
        }));
    }
    return [];
};
