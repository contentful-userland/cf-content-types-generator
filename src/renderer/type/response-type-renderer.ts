import { SourceFile } from 'ts-morph';
import { CFContentType } from '../../types';
import { renderTypeGeneric, renderTypeLiteral, renderTypeUnion } from '../generic';
import { BaseContentTypeRenderer } from './base-content-type-renderer';

/*
 * Renders the response types for the contentful content types
 * Based on https://github.com/contentful/contentful.js/issues/2138#issuecomment-1921923508
 */
const ChainModifiers = {
  WITHOUT_UNRESOLVABLE_LINKS: 'WithoutUnresolvableLinksResponse',
  WITHOUT_LINK_RESOLUTION: 'WithoutLinkResolutionResponse',
  WITH_ALL_LOCALES: 'WithAllLocalesResponse',
  WITH_ALL_LOCALES_AND_WITHOUT_LINK_RESOLUTION: 'WithAllLocalesAndWithoutLinkResolutionResponse',
  WITH_ALL_LOCALES_AND_WITHOUT_UNRESOLVABLE_LINK:
    'WithAllLocalesAndWithoutUnresolvableLinksResponse',
};

const LocaleWithDefaultTypeString = 'Locales extends LocaleCode = LocaleCode';

export class ResponseTypeRenderer extends BaseContentTypeRenderer {
  public render = (contentType: CFContentType, file: SourceFile): void => {
    const context = this.createContext();

    const entityName = context.moduleName(contentType.sys.id);

    file.addTypeAlias({
      name: `${entityName}${ChainModifiers.WITHOUT_LINK_RESOLUTION}`,
      isExported: true,
      type: renderTypeGeneric(
        entityName,
        renderTypeUnion([renderTypeLiteral('WITHOUT_LINK_RESOLUTION')]),
      ),
    });

    file.addTypeAlias({
      name: `${entityName}${ChainModifiers.WITHOUT_UNRESOLVABLE_LINKS}`,
      isExported: true,
      type: renderTypeGeneric(
        entityName,
        renderTypeUnion([renderTypeLiteral('WITHOUT_UNRESOLVABLE_LINKS')]),
      ),
    });

    file.addTypeAlias({
      name: `${entityName}${ChainModifiers.WITH_ALL_LOCALES}<${LocaleWithDefaultTypeString}>`,
      isExported: true,
      type: renderTypeGeneric(
        entityName,
        renderTypeUnion([renderTypeLiteral('WITH_ALL_LOCALES')]),
        'Locales',
      ),
    });

    file.addTypeAlias({
      name: `${entityName}${ChainModifiers.WITH_ALL_LOCALES_AND_WITHOUT_LINK_RESOLUTION}<${LocaleWithDefaultTypeString}>`,
      isExported: true,
      type: renderTypeGeneric(
        entityName,
        renderTypeUnion([
          renderTypeLiteral('WITH_ALL_LOCALES'),
          renderTypeLiteral('WITHOUT_LINK_RESOLUTION'),
        ]),
        'Locales',
      ),
    });

    file.addTypeAlias({
      name: `${entityName}${ChainModifiers.WITH_ALL_LOCALES_AND_WITHOUT_UNRESOLVABLE_LINK}<${LocaleWithDefaultTypeString}>`,
      isExported: true,
      type: renderTypeGeneric(
        entityName,
        renderTypeUnion([
          renderTypeLiteral('WITH_ALL_LOCALES'),
          renderTypeLiteral('WITHOUT_UNRESOLVABLE_LINKS'),
        ]),
        'Locales',
      ),
    });

    file.organizeImports({
      ensureNewLineAtEndOfFile: true,
    });

    file.formatText();
  };
}
