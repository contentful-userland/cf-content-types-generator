import CFDefinitionsBuilder, {
  ContentTypeRenderer,
  ResponseTypeRenderer,
  TypeGuardRenderer,
} from '../src';
import * as fs from 'fs-extra';
import * as os from 'node:os';
import * as path from 'node:path';
import stripIndent = require('strip-indent');

describe('A Contentful definitions builder', () => {
  let builder: CFDefinitionsBuilder;

  beforeEach(() => {
    builder = new CFDefinitionsBuilder();
  });

  const modelType = {
    name: 'Root Name',
    sys: {
      id: 'sysId',
      type: 'ContentType',
    },
    fields: [],
  };

  it('throws on invalid input', () => {
    expect(() =>
      builder.appendType({
        ...modelType,
        sys: {
          id: 'irrelevant',
          type: 'UnknownType',
        },
      }),
    ).toThrow('given data is not describing a ContentType');
  });

  it('uses modern output by default', () => {
    builder.appendType(modelType);

    expect(('\n' + builder.toString()).trim()).toEqual(
      stripIndent(`
        import type { ChainModifiers, Entry, EntrySkeletonType, LocaleCode } from "contentful";

        export interface TypeSysIdFields {
        }

        export type TypeSysIdSkeleton = EntrySkeletonType<TypeSysIdFields, "sysId">;
        export type TypeSysId<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeSysIdSkeleton, Modifiers, Locales>;
      `).trim(),
    );
  });

  it('renders modern field types', () => {
    builder.appendType({
      ...modelType,
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
    });

    expect(('\n' + builder.toString()).trim()).toEqual(
      stripIndent(`
        import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

        export interface TypeSysIdFields {
            symbolFieldId: EntryFieldTypes.Symbol;
        }

        export type TypeSysIdSkeleton = EntrySkeletonType<TypeSysIdFields, "sysId">;
        export type TypeSysId<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeSysIdSkeleton, Modifiers, Locales>;
      `).trim(),
    );
  });

  it('imports linked skeletons', () => {
    builder.appendType({
      ...modelType,
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
    });

    expect(('\n' + builder.toString()).trim()).toEqual(
      stripIndent(`
        import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";
        import type { TypeLinkedTypeSkeleton } from "./TypeLinkedType";

        export interface TypeSysIdFields {
            linkFieldId?: EntryFieldTypes.EntryLink<TypeLinkedTypeSkeleton>;
        }

        export type TypeSysIdSkeleton = EntrySkeletonType<TypeSysIdFields, "sysId">;
        export type TypeSysId<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeSysIdSkeleton, Modifiers, Locales>;
      `).trim(),
    );
  });

  it('layers type guards on modern output', () => {
    builder = new CFDefinitionsBuilder([new ContentTypeRenderer(), new TypeGuardRenderer()]);
    builder.appendType(modelType);

    expect(builder.toString()).toContain(
      'export function isTypeSysId<Modifiers extends ChainModifiers, Locales extends LocaleCode>',
    );
  });

  it('layers response aliases on modern output', () => {
    builder = new CFDefinitionsBuilder([new ContentTypeRenderer(), new ResponseTypeRenderer()]);
    builder.appendType(modelType);

    expect(builder.toString()).toContain('export type TypeSysIdWithoutLinkResolutionResponse');
  });

  it('sanitizes generated identifiers while preserving original content type ids', () => {
    builder.appendType({
      ...modelType,
      sys: {
        id: 'Page.ComparisonBlock',
        type: 'ContentType',
      },
    });

    expect(('\n' + builder.toString()).trim()).toEqual(
      stripIndent(`
        import type { ChainModifiers, Entry, EntrySkeletonType, LocaleCode } from "contentful";

        export interface TypePage__ComparisonBlockFields {
        }

        export type TypePage__ComparisonBlockSkeleton = EntrySkeletonType<TypePage__ComparisonBlockFields, "Page.ComparisonBlock">;
        export type TypePage__ComparisonBlock<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypePage__ComparisonBlockSkeleton, Modifiers, Locales>;
      `).trim(),
    );
  });

  it('writes generated files and index output', async () => {
    const outDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cfctg-builder-'));
    builder.appendType(modelType);

    await builder.write(outDir, fs.writeFile);

    expect(await fs.pathExists(path.join(outDir, 'index.ts'))).toBe(true);
    expect(await fs.pathExists(path.join(outDir, 'TypeSysId.ts'))).toBe(true);
  });
});
