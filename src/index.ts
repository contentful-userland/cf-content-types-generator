import {Command, flags} from '@oclif/command';
import * as fs from 'fs-extra';
import {writeFile} from 'fs-extra';
import * as path from 'path';
import CFDefinitionsBuilder from './cf-definitions-builder';

const contentfulExport = require('contentful-export');

class ContentfulMdg extends Command {
    static description = 'Contentful Content Types (TS Definitions) Generator';

    static flags = {
        version: flags.version({char: 'v'}),
        help: flags.help({char: 'h'}),
        out: flags.string({char: 'o', description: 'output directory'}),
        preserve: flags.boolean({char: 'p', description: 'preserve output folder'}),

        // remote access
        spaceId: flags.string({char: 's', description: 'space id'}),
        token: flags.string({char: 't', description: 'management token', default: process.env.CTF_CMA_TOKEN}),
        environment: flags.string({char: 'e', description: 'environment'}),
    };

    static args = [{name: 'file', description: 'local export (.json)'}];

    async run() {
        const {args, flags} = this.parse(ContentfulMdg);

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

        const builder = new CFDefinitionsBuilder();
        content.contentTypes.forEach(builder.appendType);

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

export = ContentfulMdg
