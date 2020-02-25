import * as fs from 'fs-extra';
import {Command, flags} from '@oclif/command';
import CFDefinitionsBuilder from './cf-definitions-builder';

class ContentfulMdg extends Command {
    static description = ' Content Types Generator (TS)';

    static flags = {
        version: flags.version({char: 'v'}),
        help: flags.help({char: 'h'}),
    };

    static args = [{name: 'file'}, {name: 'out'}];

    async run() {
        const {args} = this.parse(ContentfulMdg);

        if (!fs.existsSync(args.file)) {
            this.error(`file ${args.file} doesn't exists.`);
        }

        const content = await fs.readJSON(args.file);
        if (!content.contentTypes) {
            this.error(`file ${args.file} is missing "contentTypes" field`);
        }

        const builder = new CFDefinitionsBuilder();
        content.contentTypes.forEach(builder.appendType);

        if (args.out) {
            await builder.write(args.out);
        } else {
            this.log(builder.toString());
        }
    }
}

export = ContentfulMdg
