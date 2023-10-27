import { Project, ScriptTarget, SourceFile } from 'ts-morph';
import {
  CFContentType,
  CFEditorInterface,
  DefaultContentTypeRenderer,
  JsDocRenderer,
  V10ContentTypeRenderer,
} from '../../../src';
import {
  defaultJsDocRenderOptions,
  JSDocRenderOptions,
} from '../../../src/renderer/type/js-doc-renderer';

describe('A JSDoc content type renderer class', () => {
  let project: Project;
  let testFile: SourceFile;
  let mockContentType: CFContentType;

  beforeEach(() => {
    project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        target: ScriptTarget.ES5,
        declaration: true,
      },
    });

    mockContentType = {
      name: 'Animal',
      sys: {
        id: 'animal',
        type: 'Symbol',
      },
      fields: [
        {
          id: 'bread',
          name: 'Bread',
          disabled: false,
          localized: false,
          required: true,
          type: 'Symbol',
          omitted: false,
          validations: [],
        },
      ],
    };

    testFile = project.createSourceFile('test.ts');
  });

  describe('with default Entry Docs renderer', () => {
    it('renders default JSDocs', () => {
      const defaultRenderer = new DefaultContentTypeRenderer();
      defaultRenderer.setup(project);
      defaultRenderer.render(mockContentType, testFile);

      const docsRenderer = new JsDocRenderer();
      docsRenderer.render(mockContentType, testFile);

      expect('\n' + testFile.getFullText()).toMatchInlineSnapshot(`
        "
        import type { Entry, EntryFields } from "contentful";

        /**
         * Fields type definition for content type 'TypeAnimal'
         * @name TypeAnimalFields
         * @type {TypeAnimalFields}
         * @memberof TypeAnimal
         */
        export interface TypeAnimalFields {
            /**
             * Field type definition for field 'bread' (Bread)
             * @name Bread
             * @localized false
             */
            bread: EntryFields.Symbol;
        }

        /**
         * Entry type definition for content type 'animal' (Animal)
         * @name TypeAnimal
         * @type {TypeAnimal}
         */
        export type TypeAnimal = Entry<TypeAnimalFields>;
        "
      `);
    });

    it('renders JSDocs with v10 flag', () => {
      const v10Renderer = new V10ContentTypeRenderer();
      v10Renderer.setup(project);
      v10Renderer.render(mockContentType, testFile);

      const docsRenderer = new JsDocRenderer();
      docsRenderer.render(mockContentType, testFile);

      expect('\n' + testFile.getFullText()).toMatchInlineSnapshot(`
        "
        import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

        /**
         * Fields type definition for content type 'TypeAnimal'
         * @name TypeAnimalFields
         * @type {TypeAnimalFields}
         * @memberof TypeAnimal
         */
        export interface TypeAnimalFields {
            /**
             * Field type definition for field 'bread' (Bread)
             * @name Bread
             * @localized false
             */
            bread: EntryFieldTypes.Symbol;
        }

        /**
         * Entry skeleton type definition for content type 'animal' (Animal)
         * @name TypeAnimalSkeleton
         * @type {TypeAnimalSkeleton}
         */
        export type TypeAnimalSkeleton = EntrySkeletonType<TypeAnimalFields, "animal">;
        /**
         * Entry type definition for content type 'animal' (Animal)
         * @name TypeAnimal
         * @type {TypeAnimal}
         */
        export type TypeAnimal<Modifiers extends ChainModifiers, Locales extends LocaleCode> = Entry<TypeAnimalSkeleton, Modifiers, Locales>;
        "
      `);
    });

    it('renders optional Entry @author tag', () => {
      const defaultRenderer = new DefaultContentTypeRenderer();
      defaultRenderer.setup(project);

      // @ts-expect-error currently not defined
      mockContentType.sys.createdBy = {
        sys: {
          id: '<user-id>',
        },
      };

      defaultRenderer.render(mockContentType, testFile);

      const docsRenderer = new JsDocRenderer();
      docsRenderer.render(mockContentType, testFile);

      expect('\n' + testFile.getFullText()).toMatchInlineSnapshot(`
        "
        import type { Entry, EntryFields } from "contentful";

        /**
         * Fields type definition for content type 'TypeAnimal'
         * @name TypeAnimalFields
         * @type {TypeAnimalFields}
         * @memberof TypeAnimal
         */
        export interface TypeAnimalFields {
            /**
             * Field type definition for field 'bread' (Bread)
             * @name Bread
             * @localized false
             */
            bread: EntryFields.Symbol;
        }

        /**
         * Entry type definition for content type 'animal' (Animal)
         * @name TypeAnimal
         * @type {TypeAnimal}
         * @author <user-id>
         */
        export type TypeAnimal = Entry<TypeAnimalFields>;
        "
      `);
    });

    it('renders optional Entry @version tag', () => {
      const defaultRenderer = new DefaultContentTypeRenderer();
      defaultRenderer.setup(project);

      // @ts-expect-error currently not defined
      mockContentType.sys.publishedVersion = 5;

      defaultRenderer.render(mockContentType, testFile);

      const docsRenderer = new JsDocRenderer();
      docsRenderer.render(mockContentType, testFile);

      expect('\n' + testFile.getFullText()).toMatchInlineSnapshot(`
        "
        import type { Entry, EntryFields } from "contentful";

        /**
         * Fields type definition for content type 'TypeAnimal'
         * @name TypeAnimalFields
         * @type {TypeAnimalFields}
         * @memberof TypeAnimal
         */
        export interface TypeAnimalFields {
            /**
             * Field type definition for field 'bread' (Bread)
             * @name Bread
             * @localized false
             */
            bread: EntryFields.Symbol;
        }

        /**
         * Entry type definition for content type 'animal' (Animal)
         * @name TypeAnimal
         * @type {TypeAnimal}
         * @version 5
         */
        export type TypeAnimal = Entry<TypeAnimalFields>;
        "
      `);
    });

    it('renders optional Entry @since tag', () => {
      const defaultRenderer = new DefaultContentTypeRenderer();
      defaultRenderer.setup(project);

      // @ts-expect-error currently not defined
      mockContentType.sys.firstPublishedAt = '1675420727';

      defaultRenderer.render(mockContentType, testFile);

      const docsRenderer = new JsDocRenderer();
      docsRenderer.render(mockContentType, testFile);

      expect('\n' + testFile.getFullText()).toMatchInlineSnapshot(`
        "
        import type { Entry, EntryFields } from "contentful";

        /**
         * Fields type definition for content type 'TypeAnimal'
         * @name TypeAnimalFields
         * @type {TypeAnimalFields}
         * @memberof TypeAnimal
         */
        export interface TypeAnimalFields {
            /**
             * Field type definition for field 'bread' (Bread)
             * @name Bread
             * @localized false
             */
            bread: EntryFields.Symbol;
        }

        /**
         * Entry type definition for content type 'animal' (Animal)
         * @name TypeAnimal
         * @type {TypeAnimal}
         * @since 1675420727
         */
        export type TypeAnimal = Entry<TypeAnimalFields>;
        "
      `);
    });

    it('renders field @summary tag', () => {
      const defaultRenderer = new DefaultContentTypeRenderer();
      defaultRenderer.setup(project);
      defaultRenderer.render(mockContentType, testFile);

      const docsRenderer = new JsDocRenderer();

      const editorInterface: CFEditorInterface = {
        sys: { contentType: { sys: { id: 'animal' } } },
        controls: [{ fieldId: 'bread', settings: { helpText: 'Help text for the bread field.' } }],
      };

      docsRenderer.render(mockContentType, testFile, editorInterface);
      expect('\n' + testFile.getFullText()).toMatchInlineSnapshot(`
        "
        import type { Entry, EntryFields } from "contentful";

        /**
         * Fields type definition for content type 'TypeAnimal'
         * @name TypeAnimalFields
         * @type {TypeAnimalFields}
         * @memberof TypeAnimal
         */
        export interface TypeAnimalFields {
            /**
             * Field type definition for field 'bread' (Bread)
             * @name Bread
             * @localized false
             * @summary Help text for the bread field.
             */
            bread: EntryFields.Symbol;
        }

        /**
         * Entry type definition for content type 'animal' (Animal)
         * @name TypeAnimal
         * @type {TypeAnimal}
         */
        export type TypeAnimal = Entry<TypeAnimalFields>;
        "
      `);
    });
  });

  describe('with custom Entry Docs renderer', () => {
    it('renders custom JSDoc for Entry type', () => {
      const defaultRenderer = new DefaultContentTypeRenderer();
      defaultRenderer.setup(project);

      defaultRenderer.render(mockContentType, testFile);

      const customRendererOptions: JSDocRenderOptions = {
        renderFieldsDocs: defaultJsDocRenderOptions.renderFieldsDocs,
        renderEntryDocs: () => {
          return {
            description: 'Custom entry description',
          };
        },
      };

      const docsRenderer = new JsDocRenderer({ renderOptions: customRendererOptions });
      docsRenderer.render(mockContentType, testFile);

      expect('\n' + testFile.getFullText()).toMatchInlineSnapshot(`
        "
        import type { Entry, EntryFields } from "contentful";

        /**
         * Fields type definition for content type 'TypeAnimal'
         * @name TypeAnimalFields
         * @type {TypeAnimalFields}
         * @memberof TypeAnimal
         */
        export interface TypeAnimalFields {
            /**
             * Field type definition for field 'bread' (Bread)
             * @name Bread
             * @localized false
             */
            bread: EntryFields.Symbol;
        }

        /** Custom entry description */
        export type TypeAnimal = Entry<TypeAnimalFields>;
        "
      `);
    });
  });
});
