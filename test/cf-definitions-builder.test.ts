// eslint-disable-next-line import/no-named-as-default
import CFDefinitionsBuilder, {
  ContentTypeRenderer,
  ResponseTypeRenderer,
  TypeGuardRenderer,
} from '../src';
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
});
