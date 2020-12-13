import {Field} from 'contentful';
import {ImportDeclarationStructure, OptionalKind} from 'ts-morph';
import {linkContentTypeValidations, moduleFieldsName, moduleName} from './utils';

const moduleImport = (module: string) => ({
    moduleSpecifier: `./${moduleName(module)}`,
    namedImports: [
        moduleFieldsName(module),
    ],
});

export const propertyImports = (field: Field, ignoreModule?: string): OptionalKind<ImportDeclarationStructure>[] => {
    const filterIgnoredModule = (name: string) => ignoreModule !== moduleName(name);

    if (field.type === 'Link' && field.linkType === 'Entry') {
        return field.validations?.length > 0 ? linkContentTypeValidations(field)
            .filter(filterIgnoredModule)
            .map(moduleImport) : [moduleImport(field.id)];
    }
    if (field.type === 'Array' && field.items) {
        return linkContentTypeValidations(field.items)
            .filter(filterIgnoredModule)
            .map(moduleImport);
    }
    return [];
};
