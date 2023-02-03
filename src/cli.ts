import { Command, flags } from '@oclif/command';
import * as fs from 'fs-extra';
import { writeFile } from 'fs-extra';
import * as path from 'node:path';
import CFDefinitionsBuilder from './cf-definitions-builder';
import {
  ContentTypeRenderer,
  DefaultContentTypeRenderer,
  JsDocRenderer,
  LocalizedContentTypeRenderer,
} from './renderer/type';

// eslint-disable-next-line unicorn/prefer-module
const contentfulExport = require('contentful-export');
class ContentfulMdg extends Command {
  static description = 'Contentful Content Types (TS Definitions) Generator';

  static flags = {
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
    out: flags.string({ char: 'o', description: 'output directory' }),
    preserve: flags.boolean({ char: 'p', description: 'preserve output folder' }),
    localized: flags.boolean({ char: 'l', description: 'add localized types' }),
    jsdoc: flags.boolean({ char: 'd', description: 'add JSDoc comments' }),

    // remote access
    spaceId: flags.string({ char: 's', description: 'space id' }),
    token: flags.string({
      char: 't',
      description: 'management token',
      default: process.env.CTF_CMA_TOKEN,
    }),
    environment: flags.string({ char: 'e', description: 'environment' }),
  };

  static args = [{ name: 'file', description: 'local export (.json)' }];

  async run(): Promise<string | void> {
    const { args, flags } = this.parse(ContentfulMdg);

    if (args.file && !fs.existsSync(args.file)) {
      this.error(`file ${args.file} doesn't exists.`);
    }

    let content;

    if (args.file) {
      content = await fs.readJSON(args.file);
      if (!content.contentTypes) this.error(`file ${args.file} is missing "contentTypes" field`);
    } else {
      if (!flags.spaceId) this.error('Please specify "spaceId".');
      if (!flags.token) this.error('Please specify "token".');

      content = await contentfulExport({
        spaceId: flags.spaceId,
        managementToken: flags.token,
        environmentId: flags.environment,
        skipEditorInterfaces: true,
        skipContent: true,
        skipRoles: true,
        skipWebhooks: true,
        saveFile: false,
      });
    }

    const renderers: ContentTypeRenderer[] = [new DefaultContentTypeRenderer()];
    if (flags.localized) {
      renderers.push(new LocalizedContentTypeRenderer());
    }

    if (flags.jsdoc) {
      renderers.push(new JsDocRenderer());
    }

    const builder = new CFDefinitionsBuilder(renderers);
    for (const model of content.contentTypes) {
      builder.appendType(model);
    }

    if (flags.out) {
      const outDir = path.resolve(flags.out);
      if (!flags.preserve && fs.existsSync(outDir)) {
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
