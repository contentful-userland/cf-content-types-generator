import { ContentTypeFieldType } from 'contentful';
import { Project, ScriptTarget, SourceFile } from 'ts-morph';
import {
  CFContentType,
  ContentTypeRenderer,
  createContext,
  FieldRenderer,
  moduleFieldsName,
  moduleName,
  moduleSkeletonName,
  RenderContext,
  renderers,
  renderTypeGeneric,
} from '../../../src';
import stripIndent = require('strip-indent');

describe('ContentTypeRenderer', () => {
  let project: Project;
  let testFile: SourceFile;

  beforeEach(() => {
    project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        target: ScriptTarget.ES5,
        declaration: true,
      },
    });
    testFile = project.createSourceFile('test.ts');
  });

  it('renders modern content type output', () => {
    const renderer = new ContentTypeRenderer();

    const contentType: CFContentType = {
      name: 'unused-name',
      sys: {
        id: 'test',
        type: 'Symbol',
      },
      fields: [
        {
          id: 'linkFieldId',
          name: 'Linked entry Field',
          type: 'Link',
          localized: false,
          required: true,
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
    };

    renderer.render(contentType, testFile);

    expect(('\n' + testFile.getFullText()).trim()).toEqual(
      stripIndent(`
        import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";
        import type { TypeLinkedTypeSkeleton } from "./TypeLinkedType";

        export interface TypeTestFields {
            linkFieldId: EntryFieldTypes.EntryLink<TypeLinkedTypeSkeleton>;
        }

        export type TypeTestSkeleton = EntrySkeletonType<TypeTestFields, "test">;
        export type TypeTest<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeTestSkeleton, Modifiers, Locales>;
      `).trim(),
    );
  });

  it('renders with a single default modifier', () => {
    const renderer = new ContentTypeRenderer({ defaultModifiers: ['WITHOUT_LINK_RESOLUTION'] });

    const contentType: CFContentType = {
      name: 'unused-name',
      sys: { id: 'test', type: 'Symbol' },
      fields: [],
    };

    renderer.render(contentType, testFile);

    expect(('\n' + testFile.getFullText()).trim()).toEqual(
      stripIndent(`
        import type { ChainModifiers, Entry, EntrySkeletonType, LocaleCode } from "contentful";

        export interface TypeTestFields {
        }

        export type TypeTestSkeleton = EntrySkeletonType<TypeTestFields, "test">;
        export type TypeTest<Modifiers extends ChainModifiers = "WITHOUT_LINK_RESOLUTION", Locales extends LocaleCode = LocaleCode> = Entry<TypeTestSkeleton, Modifiers, Locales>;
      `).trim(),
    );
  });

  it('renders with a single default undefined modifier', () => {
    const renderer = new ContentTypeRenderer({ defaultModifiers: ['undefined'] });

    const contentType: CFContentType = {
      name: 'unused-name',
      sys: { id: 'test', type: 'Symbol' },
      fields: [],
    };

    renderer.render(contentType, testFile);

    expect(('\n' + testFile.getFullText()).trim()).toEqual(
      stripIndent(`
        import type { ChainModifiers, Entry, EntrySkeletonType, LocaleCode } from "contentful";

        export interface TypeTestFields {
        }

        export type TypeTestSkeleton = EntrySkeletonType<TypeTestFields, "test">;
        export type TypeTest<Modifiers extends ChainModifiers = undefined, Locales extends LocaleCode = LocaleCode> = Entry<TypeTestSkeleton, Modifiers, Locales>;
      `).trim(),
    );
  });

  it('renders with multiple default modifiers as a union', () => {
    const renderer = new ContentTypeRenderer({
      defaultModifiers: ['WITH_ALL_LOCALES', 'WITHOUT_LINK_RESOLUTION'],
    });

    const contentType: CFContentType = {
      name: 'unused-name',
      sys: { id: 'test', type: 'Symbol' },
      fields: [],
    };

    renderer.render(contentType, testFile);

    expect(('\n' + testFile.getFullText()).trim()).toEqual(
      stripIndent(`
        import type { ChainModifiers, Entry, EntrySkeletonType, LocaleCode } from "contentful";

        export interface TypeTestFields {
        }

        export type TypeTestSkeleton = EntrySkeletonType<TypeTestFields, "test">;
        export type TypeTest<Modifiers extends ChainModifiers = "WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales extends LocaleCode = LocaleCode> = Entry<TypeTestSkeleton, Modifiers, Locales>;
      `).trim(),
    );
  });
});

const symbolTypeRenderer = () => {
  return 'Test.Symbol';
};

describe('Derived ContentTypeRenderer', () => {
  let project: Project;
  let testFile: SourceFile;

  beforeEach(() => {
    project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        target: ScriptTarget.ES5,
        declaration: true,
      },
    });
    testFile = project.createSourceFile('test.ts');
  });

  it('can override field renderers', () => {
    class DerivedContentTypeRenderer extends ContentTypeRenderer {
      public createContext(): RenderContext {
        return {
          ...createContext(),
          moduleName,
          moduleFieldsName,
          moduleReferenceName: moduleSkeletonName,
          moduleSkeletonName,
          getFieldRenderer: <FType extends ContentTypeFieldType>(fieldType: FType) => {
            if (fieldType === 'Symbol') {
              return symbolTypeRenderer as FieldRenderer<FType>;
            }

            return renderers[fieldType] as FieldRenderer<FType>;
          },
        };
      }
    }

    const renderer = new DerivedContentTypeRenderer();

    renderer.render(
      {
        name: 'unused-name',
        sys: {
          id: 'test',
          type: 'Symbol',
        },
        fields: [
          {
            id: 'field_id',
            name: 'field_name',
            disabled: false,
            localized: false,
            required: true,
            type: 'Symbol',
            omitted: false,
            validations: [],
          },
        ],
      },
      testFile,
    );

    expect(('\n' + testFile.getFullText()).trim()).toEqual(
      stripIndent(`
        import type { ChainModifiers, Entry, EntrySkeletonType, LocaleCode } from "contentful";

        export interface TypeTestFields {
            field_id: Test.Symbol;
        }

        export type TypeTestSkeleton = EntrySkeletonType<TypeTestFields, "test">;
        export type TypeTest<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeTestSkeleton, Modifiers, Locales>;
      `).trim(),
    );
  });

  it('can override entry rendering', () => {
    class DerivedContentTypeRenderer extends ContentTypeRenderer {
      protected renderEntryType(contentType: CFContentType, context: RenderContext): string {
        context.imports.add({
          moduleSpecifier: '@custom',
          namedImports: ['IdScopedEntry'],
          isTypeOnly: true,
        });

        return renderTypeGeneric(
          'IdScopedEntry',
          `'${contentType.sys.id}', ${context.moduleSkeletonName(contentType.sys.id)}`,
        );
      }
    }

    const renderer = new DerivedContentTypeRenderer();

    renderer.render(
      {
        name: 'display name',
        sys: {
          id: 'test',
          type: 'Symbol',
        },
        fields: [
          {
            id: 'field_id',
            name: 'field_name',
            disabled: false,
            localized: false,
            required: true,
            type: 'Symbol',
            omitted: false,
            validations: [],
          },
        ],
      },
      testFile,
    );

    expect(('\n' + testFile.getFullText()).trim()).toEqual(
      stripIndent(`
        import type { IdScopedEntry } from "@custom";
        import type { EntryFieldTypes, EntrySkeletonType } from "contentful";

        export interface TypeTestFields {
            field_id: EntryFieldTypes.Symbol;
        }

        export type TypeTestSkeleton = EntrySkeletonType<TypeTestFields, "test">;
        export type TypeTest<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = IdScopedEntry<'test', TypeTestSkeleton>;
      `).trim(),
    );
  });
});
