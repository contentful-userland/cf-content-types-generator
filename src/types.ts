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
