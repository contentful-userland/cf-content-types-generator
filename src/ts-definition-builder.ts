import {block, indent, newline} from './util';
import {DEFAULT_EXPORT_TYPE, DEFAULT_INDENT_SIZE, DEFAULT_INDENT_TYPE} from './defaults';

export type TDBConfig = {
    indent?: 'tab' | 'space';
    indentSize?: number;
    type?: 'type' | 'interface';
}

export default class TSDefinitionBuilder {
    private name?: string;

    private imports: string[];

    private content: string[];

    private readonly config: Required<TDBConfig>;

    constructor(name: string, config: TDBConfig = {}) {
        this.name = name;
        this.imports = [];
        this.content = [];
        this.config = Object.assign({
            indent: DEFAULT_INDENT_TYPE,
            indentSize: DEFAULT_INDENT_SIZE,
            type: DEFAULT_EXPORT_TYPE,
        }, config);
    }

    public appendImport = (value: string): TSDefinitionBuilder => {
        if (!this.imports.includes(value)) {
            this.imports.push(value);
        }
        return this;
    };

    public appendField = (key: string, value: string, required = false): TSDefinitionBuilder => {
        this.appendLine(`${key}${required ? '' : '?'}: ${value};`);
        return this;
    };

    public appendBooleanField = (key: string, required = false): TSDefinitionBuilder => {
        this.appendField(key, 'boolean', required);
        return this;
    };

    public appendStringField = (key: string, required = false): TSDefinitionBuilder => {
        this.appendField(key, 'string', required);
        return this;
    };

    public appendNumberField = (key: string, required = false): TSDefinitionBuilder => {
        this.appendField(key, 'number', required);
        return this;
    };

    public toString = (): string => {
        if (!this.name) {
            throw new Error('please specify a name');
        }

        let imports = '';

        if (this.imports.length > 0) {
            imports = this.imports.join(newline()) + newline();
        }

        return imports + this.wrapper(this.content.map(this.indent).join(newline()));
    };

    public clear = (): void => {
        this.name = undefined;
        this.content = [];
        this.imports = [];
    };

    private append = (value: string): TSDefinitionBuilder => {
        this.content.push(value);
        return this;
    };

    private appendLine = (value?: string): TSDefinitionBuilder => {
        value && this.append(value);
        return this;
    };

    private indent = (content: string): string => {
        return indent(content, this.config.indent, this.config.indentSize);
    };

    private wrapper = (content: string): string => {
        return (this.config.type === 'type' ? `type ${this.name} = ` : `interface ${this.name} `) +
            block(content);
    };
}
