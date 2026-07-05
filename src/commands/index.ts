import { Args, Command, Flags } from '@oclif/core';
import * as fs from 'fs-extra';
import { writeFile } from 'fs-extra';
import * as path from 'node:path';
import { createRenderers } from '../cli/create-renderers';
import { emitDefinitions } from '../internal/emit-definitions';
import { loadModel } from '../internal/load-model';
import { normalizeModel } from '../internal/normalize-model';

class ContentfulMdg extends Command {
  static description = 'Contentful Content Types (TS Definitions) Generator';

  static flags = {
    version: Flags.version({ char: 'v' }),
    help: Flags.help({ char: 'h' }),
    out: Flags.string({ char: 'o', description: 'output directory' }),
    preserve: Flags.boolean({ char: 'p', description: 'preserve output folder' }),
    v10: Flags.boolean({
      char: 'X',
      hidden: true,
      description: 'removed: v10 output is now the default and only output',
    }),
    localized: Flags.boolean({
      char: 'l',
      hidden: true,
      description: 'removed: localization is built into the default output',
    }),
    jsdoc: Flags.boolean({ char: 'd', description: 'add JSDoc comments' }),
    typeguard: Flags.boolean({ char: 'g', description: 'add modern type guards' }),
    response: Flags.boolean({ char: 'r', description: 'add response types' }),
    modifiers: Flags.string({
      char: 'm',
      description: 'default Modifiers type parameter value',
      multiple: true,
      options: [
        'WITH_ALL_LOCALES',
        'WITHOUT_LINK_RESOLUTION',
        'WITHOUT_UNRESOLVABLE_LINKS',
        'WITH_LOCALE_BASED_PUBLISHING',
        'undefined',
      ],
    }),

    // remote access
    spaceId: Flags.string({ char: 's', description: 'space id' }),
    token: Flags.string({
      char: 't',
      description: 'management token',
      default: process.env.CTF_CMA_TOKEN,
    }),
    environment: Flags.string({ char: 'e', description: 'environment' }),
    host: Flags.string({ char: 'a', description: 'host', default: 'api.contentful.com' }),
    proxy: Flags.string({
      description: 'proxy URL in HTTP auth format, e.g. https://user:password@host:port',
    }),
    rawProxy: Flags.boolean({
      description: 'pass proxy config to Axios instead of creating a custom httpsAgent',
    }),
  };

  static args = {
    file: Args.file({ description: 'local export (.json)' }),
  };

  async run(): Promise<string | void> {
    const { args, flags } = await this.parse(ContentfulMdg);
    const renderers = createRenderers(flags, (message) => this.error(message));

    if (args.file && !fs.pathExistsSync(args.file)) {
      this.error(`file ${args.file} doesn't exists.`);
    }

    let content;

    if (args.file) {
      content = await loadModel({
        filePath: args.file,
      });
    } else {
      if (!flags.spaceId) this.error('Please specify "spaceId".');
      if (!flags.token) this.error('Please specify "token".');

      content = await loadModel({
        spaceId: flags.spaceId,
        managementToken: flags.token,
        environmentId: flags.environment,
        host: flags.host,
        proxy: flags.proxy,
        rawProxy: flags.rawProxy,
      });
    }

    const model = normalizeModel(content);
    const builder = emitDefinitions(model, renderers);

    if (flags.out) {
      const outDir = path.resolve(flags.out);
      if (!flags.preserve && fs.pathExistsSync(outDir)) {
        await fs.remove(outDir);
      }

      await fs.ensureDir(outDir);
      await builder.write(flags.out, writeFile);
    } else {
      this.log(builder.toString());
    }
  }
}

export = ContentfulMdg;
