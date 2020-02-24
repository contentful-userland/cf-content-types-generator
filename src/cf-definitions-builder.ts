import {Field} from 'contentful';
import TSDefinitionBuilder, {TDBConfig} from './ts-definition-builder';
import {block, indentLines, newline, typeName, unionType} from './util';
import {arrayType, linkType, literalType} from './cf-content-types';
import {DEFAULT_EXPORT_TYPE, DEFAULT_INDENT_SIZE, DEFAULT_INDENT_TYPE} from './defaults';

export type CFContentType = {
    name: string;
    id: string;
    sys: {
        id: string;
        type: string;
    };
    fields: Field[];
};

export default class CFDefinitionsBuilder {
    private types: string[];

    private imports: string[];

    private customNamespace?: string;

    private readonly config: Required<TDBConfig>;

    constructor(customNamespace?: string, config: TDBConfig = {}) {
        this.customNamespace = customNamespace;
        this.types = [];
        this.imports = [...CFDefinitionsBuilder.DefaultImports];
        this.config = Object.assign({
            indent: DEFAULT_INDENT_TYPE,
            indentSize: DEFAULT_INDENT_SIZE,
            type: DEFAULT_EXPORT_TYPE,
        }, config);
    }

    public setCustomNamespace = (customNamespace: string): CFDefinitionsBuilder => {
        this.customNamespace = customNamespace;
        return this;
    };

    public static DefaultImports = [
        'import * as Contentful from "contentful";',
        'import * as CFRichTextTypes from "@contentful/rich-text-types";',
    ];

    public appendType = (model: CFContentType): CFDefinitionsBuilder => {
        if (model.sys.type !== 'ContentType') {
            throw new Error('given data is not describing a ContentType');
        }
        this.types.push(this.contentTypeToString(model));
        return this;
    };

    public appendImport = (value: string): CFDefinitionsBuilder => {
        if (!this.imports.includes(value)) {
            this.imports.push(value);
        }
        return this;
    };

    public toString = (): string => {
        const header = '// Auto-generated TS definitions for Contentful Data models.';

        const importsToString = (): string => this.imports.join(newline());
        const typesToString = (): string => this.types.join(newline(2));

        const content = this.customNamespace
            ? `namespace ${this.customNamespace} ${block(newline() +
                indentLines(typesToString() + newline()))}`
            : typesToString();

        return ([header, importsToString(), content].join(newline(2))) + newline();
    };

    private contentTypeToString = (data: CFContentType): string => {
        const builder = new TSDefinitionBuilder(typeName(data.sys.id), this.config);
        data.fields.forEach(field => {
            switch (field.type) {
            case 'RichText':
                builder.appendField(
                    field.id,
                    unionType(['CFRichTextTypes.Block', 'CFRichTextTypes.Inline']),
                    field.required
                );
                break;
            case 'Link':
                builder.appendField(field.id, linkType(field), field.required);
                break;
            case 'Array':
                builder.appendField(field.id, arrayType(field), field.required);
                break;
            default:
                builder.appendField(field.id, literalType(field), field.required);
            }
        });
        return builder.toString();
    };
}
