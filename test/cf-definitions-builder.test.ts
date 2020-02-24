import CFDefinitionsBuilder from '../src/cf-definitions-builder';
import {expect} from '@oclif/test';
import stripIndent = require('strip-indent');

describe('A Contentful definitions builder', () => {
    let builder: CFDefinitionsBuilder;

    beforeEach(() => {
        builder = new CFDefinitionsBuilder();
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

    it('can append imports', () => {
        builder
            .appendType(modelType)
            .appendImport('import * as marco from "link";')
            .appendImport('import * as marco from "link";');
        expect('\n' + builder.toString()).to.equal(stripIndent(`
                // Auto-generated TS definitions for Contentful Data models.
                
                import * as Contentful from "contentful";
                import * as CFRichTextTypes from "@contentful/rich-text-types";
                import * as marco from "link";
                
                type SysId = {}
                `));
    });

    it('can create a definition with empty fields', () => {
        builder.appendType(modelType);
        expect('\n' + builder.toString()).to.equal(stripIndent(`
                // Auto-generated TS definitions for Contentful Data models.
                
                import * as Contentful from "contentful";
                import * as CFRichTextTypes from "@contentful/rich-text-types";
                
                type SysId = {}
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
                // Auto-generated TS definitions for Contentful Data models.
                
                import * as Contentful from "contentful";
                import * as CFRichTextTypes from "@contentful/rich-text-types";
                
                type SysId = {
                    symbolFieldId: Contentful.EntryFields.Symbol;
                }
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
                // Auto-generated TS definitions for Contentful Data models.
                
                import * as Contentful from "contentful";
                import * as CFRichTextTypes from "@contentful/rich-text-types";
                
                type SysId = {
                    symbolFieldId?: Contentful.EntryFields.Symbol;
                }
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
                // Auto-generated TS definitions for Contentful Data models.
                
                import * as Contentful from "contentful";
                import * as CFRichTextTypes from "@contentful/rich-text-types";
                
                type SysId = {
                    boolFieldId?: Contentful.EntryFields.Boolean;
                }
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
                // Auto-generated TS definitions for Contentful Data models.
                
                import * as Contentful from "contentful";
                import * as CFRichTextTypes from "@contentful/rich-text-types";
                
                type SysId = {
                    linkFieldId?: Contentful.Entry<LinkedType>;
                }
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
                // Auto-generated TS definitions for Contentful Data models.
                
                import * as Contentful from "contentful";
                import * as CFRichTextTypes from "@contentful/rich-text-types";
                
                type SysId = {
                    arrayFieldId?: Contentful.Entry<Artist | Artwork>[];
                }
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
                // Auto-generated TS definitions for Contentful Data models.
                
                import * as Contentful from "contentful";
                import * as CFRichTextTypes from "@contentful/rich-text-types";
                
                type SysId = {
                    stringFieldId?: "hello" | "world";
                }
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
                // Auto-generated TS definitions for Contentful Data models.
                
                import * as Contentful from "contentful";
                import * as CFRichTextTypes from "@contentful/rich-text-types";
                
                type SysId = {
                    numericFieldId?: 1 | 2 | 3;
                }
                `));
    });

    it('can append a custom namespace', () => {
        builder
            .setCustomNamespace('Marco')
            .appendType({
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
                // Auto-generated TS definitions for Contentful Data models.
                
                import * as Contentful from "contentful";
                import * as CFRichTextTypes from "@contentful/rich-text-types";
                
                namespace Marco {
                
                    type SysId = {
                        symbolFieldId: Contentful.EntryFields.Symbol;
                    }
                    
                }
                `));
    });
});
