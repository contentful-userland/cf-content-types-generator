import {Field} from 'contentful';
import {ImportDeclarationStructure, OptionalKind} from 'ts-morph';
import {linkContentTypeValidations, moduleName, moduleFieldsName} from './utils';

const moduleImport = (module: string) => ({
    moduleSpecifier: `./${moduleName(module)}`,
    namedImports: [
        moduleFieldsName(module),
    ],
});

export const propertyImports = (field: Field): OptionalKind<ImportDeclarationStructure>[] => {
    if (field.type === 'Link' && field.linkType === 'Entry') {
        return linkContentTypeValidations(field).map(moduleImport);
    }
    if (field.type === 'Array' && field.items) {
        return linkContentTypeValidations(field.items).map(moduleImport);
    }
    return [];
};
