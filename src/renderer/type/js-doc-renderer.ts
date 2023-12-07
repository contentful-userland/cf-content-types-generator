import { ContentTypeField } from 'contentful';
import { ContentTypeProps } from 'contentful-management';
import { JSDocStructure, JSDocTagStructure, OptionalKind, SourceFile } from 'ts-morph';
import { CFContentType, CFEditorInterface, CFEditorInterfaceControl } from '../../types';
import { BaseContentTypeRenderer } from './base-content-type-renderer';

type EntryDocsOptionsProps = {
  /* Name of generated Entry type */
  readonly name: string;
  readonly contentType: CFContentType;
};

type FieldsDocsOptionsProps = {
  /* Name of generated Fields type */
  readonly name: string;
  readonly entryName: string;
  readonly fields: ContentTypeField[];
};

type FieldDocsOptionsProps = {
  readonly field: ContentTypeField;
  readonly control?: CFEditorInterfaceControl;
};

type SkeletonDocsOptionsProps = {
  /* Name of generated Skeleton type */
  readonly name: string;
  readonly contentType: CFContentType;
};

export type JSDocRenderOptions = {
  renderEntryDocs?: (props: EntryDocsOptionsProps) => OptionalKind<JSDocStructure> | string;
  renderFieldsDocs?: (props: FieldsDocsOptionsProps) => OptionalKind<JSDocStructure> | string;
  renderFieldDocs?: (props: FieldDocsOptionsProps) => OptionalKind<JSDocStructure> | string;
  renderSkeletonDocs?: (props: SkeletonDocsOptionsProps) => OptionalKind<JSDocStructure> | string;
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
      description: `Fields type definition for content type '${entryName}'`,
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

  renderFieldDocs: ({ field, control }) => {
    const tags: OptionalKind<JSDocTagStructure>[] = [
      {
        tagName: 'name',
        text: field.name,
      },
      {
        tagName: 'localized',
        text: field.localized.toString(),
      },
    ];

    if (control?.settings?.helpText) {
      tags.push({
        tagName: 'summary',
        text: control?.settings?.helpText,
      });
    }

    return {
      description: `Field type definition for field '${field.id}' (${field.name})`,
      tags,
    };
  },

  renderSkeletonDocs: ({ contentType, name }) => {
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
      description: `Entry skeleton type definition for content type '${contentType.sys.id}' (${contentType.name})`,
      tags,
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

  public render = (
    contentType: CFContentType,
    file: SourceFile,
    editorInterfaces?: CFEditorInterface[],
  ): void => {
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

      const fields = fieldsInterface.getProperties();

      const editorInterface = editorInterfaces?.find(
        (e) => e.sys.contentType.sys.id === contentType.sys.id,
      );

      for (const field of fields) {
        const fieldName = field.getName();
        const contentTypeField = contentType.fields.find((f) => f.id === fieldName);
        const control = editorInterface?.controls.find((c) => c.fieldId === fieldName);

        if (contentTypeField) {
          field.addJsDoc(
            this.renderOptions.renderFieldDocs({
              field: contentTypeField,
              control,
            }),
          );
        }
      }
    }

    const skeletonInterfaceName = context.moduleSkeletonName(contentType.sys.id);
    const skeletonInterface = file.getTypeAlias(skeletonInterfaceName);

    if (skeletonInterface) {
      skeletonInterface.addJsDoc(
        this.renderOptions.renderSkeletonDocs({
          name: skeletonInterfaceName,
          contentType,
        }),
      );
    }
  };
}
