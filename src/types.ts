import { ContentTypeField } from 'contentful';

export type WriteCallback = (filePath: string, content: string) => Promise<void>;

export type CFContentType = {
  name: string;
  sys: {
    id: string;
    type: string;
  };
  fields: ContentTypeField[];
};

export type CFEditorInterface = {
  sys: {
    contentType: {
      sys: {
        id: string;
      };
    };
  };
  controls: CFEditorInterfaceControl[];
};

export type CFEditorInterfaceControl = {
  fieldId: string;
  settings?: {
    helpText: string;
  };
};
