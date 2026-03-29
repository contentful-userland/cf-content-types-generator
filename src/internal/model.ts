import { ContentTypeField } from 'contentful';

export type NormalizedContentTypeSys = {
  id: string;
  type: string;
  createdBy?: {
    sys: {
      id: string;
    };
  };
  firstPublishedAt?: string;
  publishedVersion?: number;
};

export type NormalizedField = ContentTypeField;

export type NormalizedContentType = {
  name: string;
  sys: NormalizedContentTypeSys;
  fields: NormalizedField[];
};

export type NormalizedEditorControl = {
  fieldId: string;
  settings?: {
    helpText: string;
  };
};

export type NormalizedEditorInterface = {
  sys: {
    contentType: {
      sys: {
        id: string;
      };
    };
  };
  controls: NormalizedEditorControl[];
};

export type ContentModel = {
  contentTypes: NormalizedContentType[];
  editorInterfaces: NormalizedEditorInterface[];
};

export type LoadedModelSource =
  | {
      kind: 'file';
      filePath: string;
    }
  | {
      kind: 'remote';
    };

export type LoadedModel = {
  source: LoadedModelSource;
  data: unknown;
};
