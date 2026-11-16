import * as fs from 'fs-extra';
import * as os from 'node:os';
import * as path from 'node:path';
import ContentfulMdg = require('../../src/commands');

jest.mock('contentful-export', () => jest.fn());

const contentfulExport = require('contentful-export') as jest.Mock;

// @oclif/core >= 4.14 detects WSL via a dynamic `import('wsl-utils')` (an ESM-only package)
// during Config.load. Jest's CommonJS runtime rejects dynamic imports unless Node runs with
// --experimental-vm-modules, so stub the platform lookup for these command tests.
const oclifOs = require(
  path.join(path.dirname(require.resolve('@oclif/core')), 'util', 'os.js'),
) as { getPlatform: () => Promise<string> };

describe('commands/index', () => {
  const fixturePath = path.resolve(__dirname, '../cases/fixtures/01-input.json');

  beforeEach(() => {
    contentfulExport.mockReset();
    jest.spyOn(oclifOs, 'getPlatform').mockResolvedValue(process.platform);
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

  it('passes proxy flags through remote fetch data', async () => {
    const outDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cfctg-proxy-'));
    contentfulExport.mockResolvedValue({
      contentTypes: [],
      editorInterfaces: [],
    });

    await ContentfulMdg.run([
      '-s',
      'space-id',
      '-t',
      'token',
      '--proxy',
      'https://user:password@proxy.example:8443',
      '--rawProxy',
      '-o',
      outDir,
    ]);

    expect(contentfulExport).toHaveBeenCalledWith(
      expect.objectContaining({
        proxy: 'https://user:password@proxy.example:8443',
        rawProxy: true,
      }),
    );
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
