import { loadModel } from '../../src/internal/load-model';

jest.mock('contentful-export', () => jest.fn());

const contentfulExport = require('contentful-export') as jest.Mock;

describe('loadModel', () => {
  const fixturePath = `${__dirname}/../cases/fixtures/01-input.json`;

  beforeEach(() => {
    contentfulExport.mockReset();
  });

  it('loads local export JSON', async () => {
    const model = await loadModel({
      filePath: fixturePath,
    });

    expect(model.source).toEqual({
      kind: 'file',
      filePath: fixturePath,
    });
    expect(model.data).toHaveProperty('contentTypes');
  });

  it('loads remote content model data', async () => {
    const remoteModel = {
      contentTypes: [],
      editorInterfaces: [],
    };
    contentfulExport.mockResolvedValue(remoteModel);

    const model = await loadModel({
      spaceId: 'space-id',
      managementToken: 'token',
      environmentId: 'master',
      host: 'api.contentful.com',
    });

    expect(contentfulExport).toHaveBeenCalledWith({
      spaceId: 'space-id',
      managementToken: 'token',
      environmentId: 'master',
      skipContent: true,
      skipRoles: true,
      skipWebhooks: true,
      saveFile: false,
      host: 'api.contentful.com',
    });
    expect(model.source).toEqual({
      kind: 'remote',
    });
    expect(model.data).toEqual(remoteModel);
  });
});
