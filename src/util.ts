import * as os from 'os';
import {DEFAULT_INDENT_SIZE, DEFAULT_INDENT_TYPE} from './defaults';

export const indent = (
    content: string,
    type: 'space' | 'tab' = DEFAULT_INDENT_TYPE,
    size: number = DEFAULT_INDENT_SIZE
): string => {
    return `${(type === 'space' ? ' ' : '\t').repeat(size)}${content}`;
};

export const indentLines = (
    content: string,
    type: 'space' | 'tab' = DEFAULT_INDENT_TYPE,
    size: number = DEFAULT_INDENT_SIZE
): string => {
    return content.split(os.EOL).map(line => indent(line, type, size)).join(os.EOL);
};

export const newline = (lines = 1): string => os.EOL.repeat(lines);

export const typeName = (name: string): string => name ? name.charAt(0).toUpperCase() + name.slice(1) : '';

export const generic = (type: string, gen: string): string => `${type}<${gen}>`;

export const unionType = (types: string[]): string => types.join(' | ');

export const asString = (value: string): string => `"${value}"`;

export const block = (content?: string): string => `{${content ? newline() + content + newline() : ''}}`;
