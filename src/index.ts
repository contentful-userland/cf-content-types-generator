import * as fs from 'fs-extra';
import {Command, flags} from '@oclif/command';
import CFDefinitionsBuilder from './cf-definitions-builder';
import {TDBConfig} from './ts-definition-builder';

class ContentfulMdg extends Command {
    static description = 'Generate (TS) Content Types';

    static flags = {
        version: flags.version({char: 'v'}),
        help: flags.help({char: 'h'}),

        namespace: flags.string({
            char: 'n',
            description: 'declare types inside a namespace',
            required: false,
        }),

        type: flags.string({
            char: 't',
            options: ['type', 'interface'],
            description: 'type or interface declaration',
            default: 'type',
            required: false,
        }),

        indent: flags.string({
            char: 'i',
            options: ['space', 'tab'],
            description: 'indention type',
            default: 'space',
            required: false,
        }),

        indentSize: flags.integer({
            char: 's',
            default: 2,
            description: 'indention size',
            required: false,
        }),

    };

    static args = [{name: 'file'}];

    async run() {
        const {args, flags} = this.parse(ContentfulMdg);

        if (!fs.existsSync(args.file)) {
            this.error(`file ${args.file} doesn't exists.`);
        }

        const content = await fs.readJSON(args.file);
        if (!content.contentTypes) {
            this.error(`file ${args.file} is missing "contentTypes" field`);
        }

        const config: TDBConfig = {};
        if (flags.type === 'type' || flags.type === 'interface') {
            config.type = flags.type;
        }
        if (flags.indent === 'space' || flags.indent === 'tab') {
            config.indent = flags.indent;
        }
        config.indentSize = flags.indentSize;

        const builder = new CFDefinitionsBuilder(flags.namespace, config);
        content.contentTypes.forEach(builder.appendType);
        this.log(builder.toString());
    }
}

export = ContentfulMdg
