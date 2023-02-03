import { Field } from 'contentful';
import { ContentTypeProps } from 'contentful-management';
import { JSDocStructure, JSDocTagStructure, OptionalKind, SourceFile } from 'ts-morph';
import { CFContentType } from '../../types';
import { BaseContentTypeRenderer } from './base-content-type-renderer';

type EntryDocsOptionsProps = {
  /* Name of generated Entry type */
  name: string;
  readonly contentType: CFContentType;
};

type FieldsDocsOptionsProps = {
  /* Name of generated Fields type */
  name: string;
  entryName: string;
  readonly fields: Field[];
};

export type JSDocRenderOptions = {
  renderEntryDocs?: (props: EntryDocsOptionsProps) => OptionalKind<JSDocStructure> | string;
  renderFieldsDocs?: (props: FieldsDocsOptionsProps) => OptionalKind<JSDocStructure> | string;
};

export const defaultJsDocRenderOptions: Required<JSDocRenderOptions> = {
  renderEntryDocs: ({ contentType, name }) => {
    const tags: OptionalKind<JSDocTagStructure>[] = [];

    tags.push(
      {
        tagName: 'name',
        text: name,
      },
      {
        tagName: 'type',
        text: `{${name}}`,
      },
    );

    const cmaContentType = contentType as ContentTypeProps;

    if (cmaContentType.sys.createdBy?.sys?.id) {
      tags.push({
        tagName: 'author',
        text: cmaContentType.sys.createdBy.sys.id,
      });
    }

    if (cmaContentType.sys.firstPublishedAt) {
      tags.push({
        tagName: 'since',
        text: cmaContentType.sys.firstPublishedAt,
      });
    }

    if (cmaContentType.sys.publishedVersion) {
      tags.push({
        tagName: 'version',
        text: cmaContentType.sys.publishedVersion.toString(),
      });
    }

    return {
      description: `Entry type definition for content type '${contentType.sys.id}' (${contentType.name})`,
      tags,
    };
  },

  renderFieldsDocs: ({ name, entryName }) => {
    return {
      description: `Fields type definition for content type '${name}'`,
      tags: [
        {
          tagName: 'name',
          text: name,
        },
        {
          tagName: 'type',
          text: `{${name}}`,
        },
        {
          tagName: 'memberof',
          text: entryName,
        },
      ],
    };
  },
};

/* JsDocRenderer only works in conjunction with other Renderers. It relays on previously rendered Interfaces */
export class JsDocRenderer extends BaseContentTypeRenderer {
  private renderOptions: Required<JSDocRenderOptions>;

  constructor({ renderOptions }: { renderOptions?: JSDocRenderOptions } = {}) {
    super();
    this.renderOptions = {
      ...defaultJsDocRenderOptions,
      ...renderOptions,
    };
  }

  public render = (contentType: CFContentType, file: SourceFile): void => {
    const context = this.createContext();

    const entryInterfaceName = context.moduleName(contentType.sys.id);
    const entryInterface = file.getTypeAlias(entryInterfaceName);

    if (entryInterface) {
      entryInterface.addJsDoc(
        this.renderOptions.renderEntryDocs({
          name: entryInterfaceName,
          contentType,
        }),
      );
    }

    const fieldsInterfaceName = context.moduleFieldsName(contentType.sys.id);
    const fieldsInterface = file.getInterface(fieldsInterfaceName);

    if (fieldsInterface) {
      fieldsInterface.addJsDoc(
        this.renderOptions.renderFieldsDocs({
          name: fieldsInterfaceName,
          entryName: entryInterfaceName,
          fields: contentType.fields,
        }),
      );
    }
  };
}
