import * as fs from 'fs-extra';
import * as os from 'node:os';
import * as path from 'node:path';
import ContentfulMdg = require('../../src/commands');

jest.mock('contentful-export', () => jest.fn());

const contentfulExport = require('contentful-export') as jest.Mock;

describe('commands/index', () => {
  const fixturePath = path.resolve(__dirname, '../cases/fixtures/01-input.json');

  beforeEach(() => {
    contentfulExport.mockReset();
  });

  it('generates from a local export file', async () => {
    const outDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cfctg-local-'));

    await ContentfulMdg.run([fixturePath, '-o', outDir]);

    expect(await fs.pathExists(path.join(outDir, 'index.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(outDir, 'TypeProduct.ts'))).toBe(true);
  });

  it('generates from remote fetch data', async () => {
    const outDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cfctg-remote-'));
    contentfulExport.mockResolvedValue({
      contentTypes: [
        {
          name: 'Animal',
          sys: {
            id: 'animal',
            type: 'ContentType',
          },
          fields: [],
        },
      ],
      editorInterfaces: [],
    });

    await ContentfulMdg.run(['-s', 'space-id', '-t', 'token', '-o', outDir]);

    expect(contentfulExport).toHaveBeenCalledWith(
      expect.objectContaining({
        spaceId: 'space-id',
        managementToken: 'token',
      }),
    );
    expect(await fs.pathExists(path.join(outDir, 'TypeAnimal.ts'))).toBe(true);
  });

  it('keeps missing source input error behavior', async () => {
    await expect(ContentfulMdg.run([])).rejects.toThrow('Please specify "spaceId".');
  });

  it('keeps removed --v10 error behavior', async () => {
    await expect(ContentfulMdg.run(['--v10'])).rejects.toThrow(
      '"--v10" was removed. v10+ output is now the default and only output.',
    );
  });

  it('keeps removed --localized error behavior', async () => {
    await expect(ContentfulMdg.run(['--localized'])).rejects.toThrow(
      '"--localized" was removed. Localization support is built into the default output.',
    );
  });
});
