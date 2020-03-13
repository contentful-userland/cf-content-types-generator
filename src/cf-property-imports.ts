import {Field} from 'contentful';
import {ImportDeclarationStructure, OptionalKind} from 'ts-morph';
import {linkContentTypeValidations, moduleName, moduleFieldsName} from './utils';

export const propertyImports = (field: Field): OptionalKind<ImportDeclarationStructure>[] => {
    if (field.type === 'Link' && field.linkType === 'Entry') {
        return linkContentTypeValidations(field).map(item => ({
            moduleSpecifier: `./${moduleName(item)}`,
            namedImports: [
                moduleFieldsName(item),
            ],
        }));
    }
    if (field.type === 'Array' && field.items) {
        return linkContentTypeValidations(field.items).map(item => ({
            moduleSpecifier: `./${moduleName(item)}`,
            namedImports: [
                moduleFieldsName(item),
            ],
        }));
    }
    return [];
};
