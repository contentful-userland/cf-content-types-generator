import { expect } from '@oclif/test';
import stripIndent = require('strip-indent');
import * as fs from 'fs-extra';
import * as path from 'path';
//@ts-ignore
import { cleanupTempDirs, createTempDir } from 'jest-fixtures';

import CFDefinitionsBuilder from '../src/cf-definitions-builder';

describe('A Contentful definitions builder', () => {
    let builder: CFDefinitionsBuilder;

    let fixturesPath: string;

    beforeEach(async () => {
        builder = new CFDefinitionsBuilder();
        fixturesPath = await createTempDir();
    });

    afterEach(async () => {
        await cleanupTempDirs();
    });

    const modelType = {
        id: 'rootId',
        name: 'Root Name',
        sys: {
            id: 'sysId',
            type: 'ContentType',
        }, fields: [],
    };

    it('throws on invalid input ()', () => {
        expect(() => builder.appendType({
            ...{}, ...modelType, ...{
                sys: {
                    id: 'irrelevant',
                    type: 'UnknownType',
                },
            },
        })).to.throw('given data is not describing a ContentType');
    });

    it('can create a definition with empty fields', () => {
        builder.appendType(modelType);
        expect('\n' + builder.toString()).to.equal(stripIndent(`
                import * as Contentful from "contentful";

                export interface SysIdFields {
                }

                export type SysId = Contentful.Entry<SysIdFields>;
                `));
    });

    it('can create a definition with a required string field', () => {
        builder.appendType({
            ...{}, ...modelType, ...{
                fields: [
                    {
                        id: 'symbolFieldId',
                        name: 'Some Symbol Field',
                        type: 'Symbol',
                        localized: false,
                        required: true,
                        validations: [],
                        disabled: false,
                        omitted: false,
                    },
                ],
            },
        });
        expect('\n' + builder.toString()).to.equal(stripIndent(`
                import * as Contentful from "contentful";
                
                export interface SysIdFields {
                    symbolFieldId: Contentful.EntryFields.Symbol;
                }

                export type SysId = Contentful.Entry<SysIdFields>;
                `));
    });

    it('can create a definition with a optional string field', () => {
        builder.appendType({
            ...{}, ...modelType, ...{
                fields: [
                    {
                        id: 'symbolFieldId',
                        name: 'Some Symbol Field',
                        type: 'Symbol',
                        localized: false,
                        required: false,
                        validations: [],
                        disabled: false,
                        omitted: false,
                    },
                ],
            },
        });
        expect('\n' + builder.toString()).to.equal(stripIndent(`
                import * as Contentful from "contentful";
                
                export interface SysIdFields {
                    symbolFieldId?: Contentful.EntryFields.Symbol;
                }

                export type SysId = Contentful.Entry<SysIdFields>;
                `));
    });

    it('can create a definition with a boolean field', () => {
        builder.appendType({
            ...{}, ...modelType, ...{
                fields: [
                    {
                        id: 'boolFieldId',
                        name: 'Some Bool Field',
                        type: 'Boolean',
                        localized: false,
                        required: false,
                        validations: [],
                        disabled: false,
                        omitted: false,
                    },
                ],
            },
        });
        expect('\n' + builder.toString()).to.equal(stripIndent(`
                import * as Contentful from "contentful";
                
                export interface SysIdFields {
                    boolFieldId?: Contentful.EntryFields.Boolean;
                }

                export type SysId = Contentful.Entry<SysIdFields>;
                `));
    });

    it('can create a definition with a linked entry field', () => {
        builder.appendType({
            ...{}, ...modelType, ...{
                fields: [
                    {
                        id: 'linkFieldId',
                        name: 'Linked entry Field',
                        type: 'Link',
                        localized: false,
                        required: false,
                        validations: [
                            {
                                linkContentType: [
                                    'linkedType',
                                ],
                            },
                        ],
                        disabled: false,
                        omitted: false,
                        linkType: 'Entry',
                    },
                ],
            },
        });
        expect('\n' + builder.toString()).to.equal(stripIndent(`
                import * as Contentful from "contentful";
                import { LinkedTypeFields } from "./LinkedType";

                export interface SysIdFields {
                    linkFieldId?: Contentful.Entry<LinkedTypeFields>;
                }

                export type SysId = Contentful.Entry<SysIdFields>;
                `));
    });

    it('can create a definition with an array field', () => {
        builder.appendType({
            ...{}, ...modelType, ...{
                fields: [
                    {
                        id: 'arrayFieldId',
                        name: 'Array Field',
                        type: 'Array',
                        localized: false,
                        required: false,
                        validations: [],
                        disabled: false,
                        omitted: false,
                        items: {
                            type: 'Link',
                            validations: [
                                {
                                    linkContentType: [
                                        'artist',
                                        'artwork',
                                    ],
                                },
                            ],
                            linkType: 'Entry',
                        },
                    },
                ],
            },
        });
        expect('\n' + builder.toString()).to.equal(stripIndent(`
                import * as Contentful from "contentful";
                import { ArtistFields } from "./Artist";
                import { ArtworkFields } from "./Artwork";

                export interface SysIdFields {
                    arrayFieldId?: Contentful.Entry<ArtistFields | ArtworkFields>[];
                }

                export type SysId = Contentful.Entry<SysIdFields>;
                `));
    });

    it('can create a definition with an string field with include validation', () => {
        builder.appendType({
            ...{}, ...modelType, ...{
                fields: [
                    {
                        id: 'stringFieldId',
                        name: 'Restricted string Field',
                        type: 'Text',
                        localized: false,
                        required: false,
                        disabled: false,
                        omitted: false,
                        validations: [
                            {
                                in: [
                                    'hello',
                                    'world',
                                ],
                            },
                        ],
                    },
                ],
            },
        });
        expect('\n' + builder.toString()).to.equal(stripIndent(`
                import * as Contentful from "contentful";

                export interface SysIdFields {
                    stringFieldId?: "hello" | "world";
                }

                export type SysId = Contentful.Entry<SysIdFields>;
                `));
    });

    it('can create a definition with an numeric field with include validation', () => {
        builder.appendType({
            ...{}, ...modelType, ...{
                fields: [
                    {
                        id: 'numericFieldId',
                        name: 'Restricted numeric Field',
                        type: 'Integer',
                        localized: false,
                        required: false,
                        disabled: false,
                        omitted: false,
                        validations: [
                            {
                                in: [
                                    '1',
                                    '2',
                                    '3',
                                ],
                            },
                        ],
                    },
                ],
            },
        });
        expect('\n' + builder.toString()).to.equal(stripIndent(`
                import * as Contentful from "contentful";
                
                export interface SysIdFields {
                    numericFieldId?: 1 | 2 | 3;
                }

                export type SysId = Contentful.Entry<SysIdFields>;
                `));
    });

    it('can write an interface to output file', async () => {
        builder.appendType(modelType);

        await builder.write(fixturesPath);

        const result = await fs.readFile(path.resolve(fixturesPath, 'SysId.ts'));

        expect('\n' + result.toString()).to.equal(stripIndent(`
                import * as Contentful from "contentful";
                
                export interface SysIdFields {
                }

                export type SysId = Contentful.Entry<SysIdFields>;
                `));
    });

    it('can write multiple interfaces to output files', async () => {
        builder.appendType(modelType);
        builder.appendType({
            id: 'rootId',
            name: 'Root Name',
            sys: {
                id: 'myType',
                type: 'ContentType',
            }, fields: [],
        });

        await builder.write(fixturesPath);

        const result1 = await fs.readFile(path.resolve(fixturesPath, 'SysId.ts'));
        const result2 = await fs.readFile(path.resolve(fixturesPath, 'MyType.ts'));

        expect('\n' + result1.toString()).to.equal(stripIndent(`
                import * as Contentful from "contentful";
                
                export interface SysIdFields {
                }

                export type SysId = Contentful.Entry<SysIdFields>;
                `));

        expect('\n' + result2.toString()).to.equal(stripIndent(`
                import * as Contentful from "contentful";
                
                export interface MyTypeFields {
                }

                export type MyType = Contentful.Entry<MyTypeFields>;
                `));
    });

    it('can reference one type to the other', async () => {
        builder.appendType(modelType);
        builder.appendType({
            id: 'rootId',
            name: 'Root Name',
            sys: {
                id: 'myType',
                type: 'ContentType',
            }, fields: [
                {
                    id: 'linkFieldId',
                    name: 'Linked entry Field',
                    type: 'Link',
                    localized: false,
                    required: false,
                    validations: [
                        {
                            linkContentType: [
                                'sysId',
                            ],
                        },
                    ],
                    disabled: false,
                    omitted: false,
                    linkType: 'Entry',
                },
            ],
        });

        await builder.write(fixturesPath);

        const result1 = await fs.readFile(path.resolve(fixturesPath, 'SysId.ts'));
        const result2 = await fs.readFile(path.resolve(fixturesPath, 'MyType.ts'));

        expect('\n' + result1.toString()).to.equal(stripIndent(`
                import * as Contentful from "contentful";
                
                export interface SysIdFields {
                }

                export type SysId = Contentful.Entry<SysIdFields>;
                `));

        expect('\n' + result2.toString()).to.equal(stripIndent(`
                import * as Contentful from "contentful";
                import { SysIdFields } from "./SysId";
                
                export interface MyTypeFields {
                    linkFieldId?: Contentful.Entry<SysIdFields>;
                }

                export type MyType = Contentful.Entry<MyTypeFields>;
                `));
    });
});
