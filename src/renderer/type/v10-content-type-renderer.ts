import { Field, FieldType } from 'contentful';
import { OptionalKind, TypeAliasDeclarationStructure } from 'ts-morph';
import { CFContentType } from '../../types';
import {
  FieldRenderer,
  FieldRenderers,
  renderPropAny,
  renderPropArray,
  renderPropLink,
} from '../field';
import { renderTypeGeneric } from '../generic';
import { createDefaultContext, RenderContext } from './create-default-context';
import { DefaultContentTypeRenderer } from './default-content-type-renderer';

export const renderV10RichText = (field: Field, context: RenderContext): string => {
  context.imports.add({
    moduleSpecifier: 'contentful',
    namedImports: ['EntryFields'],
  });
  return 'EntryFields.RichText';
};

const fieldTypeRenderers: FieldRenderers = {
  RichText: renderV10RichText,
  Link: renderPropLink,
  Array: renderPropArray,
  Text: renderPropAny,
  Symbol: renderPropAny,
  Object: renderPropAny,
  Date: renderPropAny,
  Number: renderPropAny,
  Integer: renderPropAny,
  Boolean: renderPropAny,
  Location: renderPropAny,
};

export class V10ContentTypeRenderer extends DefaultContentTypeRenderer {
  protected override addDefaultImports(context: RenderContext): void {
    context.imports.add({
      moduleSpecifier: 'contentful',
      namedImports: ['Entry'],
    });
  }

  protected renderFieldType(field: Field, context: RenderContext): string {
    return context.getFieldRenderer(field.type)(field, context);
  }

  protected renderEntry(
    contentType: CFContentType,
    context: RenderContext,
  ): OptionalKind<TypeAliasDeclarationStructure> {
    return {
      name: context.moduleName(contentType.sys.id),
      isExported: true,
      type: this.renderEntryType(contentType, context),
    };
  }

  protected renderEntryType(contentType: CFContentType, context: RenderContext): string {
    return renderTypeGeneric('Entry', context.moduleFieldsName(contentType.sys.id));
  }

  public createContext(): RenderContext {
    return {
      ...createDefaultContext(),
      getFieldRenderer: <FType extends FieldType>(fieldType: FType) =>
        fieldTypeRenderers[fieldType] as FieldRenderer<FType>,
    };
  }
}
