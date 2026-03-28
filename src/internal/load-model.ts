import * as fs from 'fs-extra';
import { LoadedModel } from './model';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const contentfulExport: typeof import('contentful-export').default = require('contentful-export');

export type LoadModelOptions =
  | {
      filePath: string;
    }
  | {
      spaceId: string;
      managementToken: string;
      environmentId?: string;
      host: string;
    };

export const loadModel = async (options: LoadModelOptions): Promise<LoadedModel> => {
  if ('filePath' in options) {
    return {
      source: {
        kind: 'file',
        filePath: options.filePath,
      },
      data: await fs.readJSON(options.filePath),
    };
  }

  return {
    source: {
      kind: 'remote',
    },
    data: await contentfulExport({
      spaceId: options.spaceId,
      managementToken: options.managementToken,
      environmentId: options.environmentId,
      skipContent: true,
      skipRoles: true,
      skipWebhooks: true,
      saveFile: false,
      host: options.host,
    }),
  };
};
