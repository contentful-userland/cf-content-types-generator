import * as fs from 'fs-extra';
import { writeFile } from 'fs-extra';
//@ts-ignore
import { cleanupTempDirs, createTempDir } from 'jest-fixtures';
import * as path from 'path';

import CFDefinitionsBuilder from '../src';
import stripIndent = require('strip-indent');

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
    name: 'Root Name',
    sys: {
      id: 'sysId',
      type: 'ContentType',
    },
    fields: [],
  };

  it('throws on invalid input ()', () => {
    expect(() =>
      builder.appendType({
        ...{},
        ...modelType,
        ...{
          sys: {
            id: 'irrelevant',
            type: 'UnknownType',
          },
        },
      }),
    ).toThrow('given data is not describing a ContentType');
  });

  it('can create a definition with empty fields', () => {
    builder.appendType(modelType);
    expect('\n' + builder.toString()).toEqual(
      stripIndent(`
                import { Entry } from "contentful";

                export interface TypeSysIdFields {
                }

                export type TypeSysId = Entry<TypeSysIdFields>;
                `),
    );
  });

  it('can create a definition with a required string field', () => {
    builder.appendType({
      ...{},
      ...modelType,
      ...{
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
    expect('\n' + builder.toString()).toEqual(
      stripIndent(`
                import { Entry, EntryFields } from "contentful";
                
                export interface TypeSysIdFields {
                    symbolFieldId: EntryFields.Symbol;
                }

                export type TypeSysId = Entry<TypeSysIdFields>;
                `),
    );
  });

  it('can create a definition with a optional string field', () => {
    builder.appendType({
      ...{},
      ...modelType,
      ...{
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
    expect('\n' + builder.toString()).toEqual(
      stripIndent(`
                import { Entry, EntryFields } from "contentful";
                
                export interface TypeSysIdFields {
                    symbolFieldId?: EntryFields.Symbol;
                }

                export type TypeSysId = Entry<TypeSysIdFields>;
                `),
    );
  });

  it('can create a definition with a boolean field', () => {
    builder.appendType({
      ...{},
      ...modelType,
      ...{
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
    expect('\n' + builder.toString()).toEqual(
      stripIndent(`
                import { Entry, EntryFields } from "contentful";
                
                export interface TypeSysIdFields {
                    boolFieldId?: EntryFields.Boolean;
                }

                export type TypeSysId = Entry<TypeSysIdFields>;
                `),
    );
  });

  it('can create a definition with a linked entry field', () => {
    builder.appendType({
      ...{},
      ...modelType,
      ...{
        fields: [
          {
            id: 'linkFieldId',
            name: 'Linked entry Field',
            type: 'Link',
            localized: false,
            required: false,
            validations: [
              {
                linkContentType: ['linkedType'],
              },
            ],
            disabled: false,
            omitted: false,
            linkType: 'Entry',
          },
        ],
      },
    });
    expect('\n' + builder.toString()).toEqual(
      stripIndent(`
                import { Entry } from "contentful";
                import { TypeLinkedTypeFields } from "./TypeLinkedType";

                export interface TypeSysIdFields {
                    linkFieldId?: Entry<TypeLinkedTypeFields>;
                }

                export type TypeSysId = Entry<TypeSysIdFields>;
                `),
    );
  });

  it('can create a definition with an array field', () => {
    builder.appendType({
      ...{},
      ...modelType,
      ...{
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
                  linkContentType: ['artist', 'artwork'],
                },
              ],
              linkType: 'Entry',
            },
          },
        ],
      },
    });
    expect('\n' + builder.toString()).toEqual(
      stripIndent(`
                import { Entry } from "contentful";
                import { TypeArtistFields } from "./TypeArtist";
                import { TypeArtworkFields } from "./TypeArtwork";

                export interface TypeSysIdFields {
                    arrayFieldId?: Entry<TypeArtistFields | TypeArtworkFields>[];
                }

                export type TypeSysId = Entry<TypeSysIdFields>;
                `),
    );
  });

  it('can create a definition with an string field with include validation', () => {
    builder.appendType({
      ...{},
      ...modelType,
      ...{
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
                in: ['hello', 'world'],
              },
            ],
          },
        ],
      },
    });
    expect('\n' + builder.toString()).toEqual(
      stripIndent(`
                import { Entry } from "contentful";

                export interface TypeSysIdFields {
                    stringFieldId?: "hello" | "world";
                }

                export type TypeSysId = Entry<TypeSysIdFields>;
                `),
    );
  });

  it('can create a definition with an numeric field with include validation', () => {
    builder.appendType({
      ...{},
      ...modelType,
      ...{
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
                in: ['1', '2', '3'],
              },
            ],
          },
        ],
      },
    });
    expect('\n' + builder.toString()).toEqual(
      stripIndent(`
                import { Entry } from "contentful";
                
                export interface TypeSysIdFields {
                    numericFieldId?: 1 | 2 | 3;
                }

                export type TypeSysId = Entry<TypeSysIdFields>;
                `),
    );
  });

  it('can write an interface to output file', async () => {
    builder.appendType(modelType);

    await builder.write(fixturesPath, writeFile);

    const result = await fs.readFile(path.resolve(fixturesPath, 'TypeSysId.ts'));

    expect('\n' + result.toString()).toEqual(
      stripIndent(`
                import { Entry } from "contentful";
                
                export interface TypeSysIdFields {
                }

                export type TypeSysId = Entry<TypeSysIdFields>;
                `),
    );
  });

  it('can write multiple interfaces to output files', async () => {
    builder.appendType(modelType);
    builder.appendType({
      name: 'Root Name',
      sys: {
        id: 'myType',
        type: 'ContentType',
      },
      fields: [],
    });

    await builder.write(fixturesPath, writeFile);

    const result1 = await fs.readFile(path.resolve(fixturesPath, 'TypeSysId.ts'));
    const result2 = await fs.readFile(path.resolve(fixturesPath, 'TypeMyType.ts'));

    expect('\n' + result1.toString()).toEqual(
      stripIndent(`
                import { Entry } from "contentful";
                
                export interface TypeSysIdFields {
                }

                export type TypeSysId = Entry<TypeSysIdFields>;
                `),
    );

    expect('\n' + result2.toString()).toEqual(
      stripIndent(`
                import { Entry } from "contentful";
                
                export interface TypeMyTypeFields {
                }

                export type TypeMyType = Entry<TypeMyTypeFields>;
                `),
    );
  });

  it('can reference one type to the other', async () => {
    builder.appendType(modelType);
    builder.appendType({
      name: 'Root Name',
      sys: {
        id: 'myType',
        type: 'ContentType',
      },
      fields: [
        {
          id: 'linkFieldId',
          name: 'Linked entry Field',
          type: 'Link',
          localized: false,
          required: false,
          validations: [
            {
              linkContentType: ['sysId'],
            },
          ],
          disabled: false,
          omitted: false,
          linkType: 'Entry',
        },
      ],
    });

    await builder.write(fixturesPath, writeFile);

    const result1 = await fs.readFile(path.resolve(fixturesPath, 'TypeSysId.ts'));
    const result2 = await fs.readFile(path.resolve(fixturesPath, 'TypeMyType.ts'));

    expect('\n' + result1.toString()).toEqual(
      stripIndent(`
                import { Entry } from "contentful";
                
                export interface TypeSysIdFields {
                }

                export type TypeSysId = Entry<TypeSysIdFields>;
                `),
    );

    expect('\n' + result2.toString()).toEqual(
      stripIndent(`
                import { Entry } from "contentful";
                import { TypeSysIdFields } from "./TypeSysId";
                
                export interface TypeMyTypeFields {
                    linkFieldId?: Entry<TypeSysIdFields>;
                }

                export type TypeMyType = Entry<TypeMyTypeFields>;
                `),
    );
  });

  it('can create index file', async () => {
    builder.appendType(modelType);
    await builder.write(fixturesPath, writeFile);

    const result1 = await fs.readFile(path.resolve(fixturesPath, 'index.ts'));
    expect('\n' + result1.toString()).toEqual(
      stripIndent(`
            export type { TypeSysId, TypeSysIdFields } from "./TypeSysId";
            `),
    );
  });

  it('can self-reference', async () => {
    builder.appendType(modelType);
    builder.appendType({
      name: 'Root Name',
      sys: {
        id: 'myType',
        type: 'ContentType',
      },
      fields: [
        {
          id: 'linkFieldId',
          name: 'Linked entry Field',
          type: 'Link',
          localized: false,
          required: false,
          validations: [
            {
              linkContentType: ['myType'],
            },
          ],
          disabled: false,
          omitted: false,
          linkType: 'Entry',
        },
      ],
    });

    await builder.write(fixturesPath, writeFile);

    const result2 = await fs.readFile(path.resolve(fixturesPath, 'TypeMyType.ts'));

    expect('\n' + result2.toString()).toEqual(
      stripIndent(`
                import { Entry } from "contentful";
                
                export interface TypeMyTypeFields {
                    linkFieldId?: Entry<TypeMyTypeFields>;
                }

                export type TypeMyType = Entry<TypeMyTypeFields>;
                `),
    );
  });

  it('is not changing source project on export', async () => {
    builder.appendType(modelType);
    builder.appendType({
      name: 'Root Name',
      sys: {
        id: 'myType',
        type: 'ContentType',
      },
      fields: [
        {
          id: 'linkFieldId',
          name: 'Linked entry Field',
          type: 'Link',
          localized: false,
          required: false,
          validations: [
            {
              linkContentType: ['myType'],
            },
          ],
          disabled: false,
          omitted: false,
          linkType: 'Entry',
        },
      ],
    });

    let beforeWriteResult: Record<string, string> = {};
    let afterWriteResult: Record<string, string> = {};

    const write = (result: Record<string, string>) => {
      return async (filePath: string, content: string) => {
        result = { [filePath]: content, ...result };
      };
    };

    const beforeResult = builder.toString();
    await builder.write(fixturesPath, write(beforeWriteResult));
    const afterResult = builder.toString();
    await builder.write(fixturesPath, write(afterWriteResult));

    expect(beforeResult).toEqual(afterResult);
    expect(beforeWriteResult).toEqual(afterWriteResult);
  });
});
