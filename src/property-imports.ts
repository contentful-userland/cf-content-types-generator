import { Field } from 'contentful';
import { ImportDeclarationStructure, OptionalKind } from 'ts-morph';
import { linkContentTypeValidations } from './extract-validation';
import { RenderContext } from './renderer';

export const propertyImports = (
  field: Field,
  context: RenderContext,
  ignoreModule?: string,
): OptionalKind<ImportDeclarationStructure>[] => {
  const filterIgnoredModule = (name: string) => ignoreModule !== context.moduleName(name);

  const moduleImport = (module: string): OptionalKind<ImportDeclarationStructure> => {
    return {
      moduleSpecifier: `./${context.moduleName(module)}`,
      namedImports: [context.moduleFieldsName(module)],
      isTypeOnly: true,
    };
  };

  if (field.type === 'Link' && field.linkType === 'Entry') {
    return field.validations?.length > 0
      ? linkContentTypeValidations(field)
          .filter((name: string) => filterIgnoredModule(name))
          .map((contentType: string) => moduleImport(contentType))
      : [moduleImport(field.id)];
  }

  if (field.type === 'Array' && field.items) {
    return linkContentTypeValidations(field.items)
      .filter((name: string) => filterIgnoredModule(name))
      .map((contentType: string) => moduleImport(contentType));
  }

  return [];
};
