import { Project, ScriptTarget, SourceFile } from 'ts-morph';
import { CFContentType, DefaultContentTypeRenderer, JsDocRenderer } from '../../../src';
import {
  defaultJsDocRenderOptions,
  JSDocRenderOptions,
} from '../../../src/renderer/type/js-doc-renderer';
import stripIndent = require('strip-indent');

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

      expect('\n' + testFile.getFullText()).toEqual(
        stripIndent(`
        import * as Contentful from "contentful";
        
        /**
         * Fields type definition for content type 'TypeAnimalFields'
         * @name TypeAnimalFields
         * @type {TypeAnimalFields}
         * @memberof TypeAnimal
         */
        export interface TypeAnimalFields {
            bread: Contentful.EntryFields.Symbol;
        }
        
        /**
         * Entry type definition for content type 'animal' (Animal)
         * @name TypeAnimal
         * @type {TypeAnimal}
         */
        export type TypeAnimal = Contentful.Entry<TypeAnimalFields>;
        `),
      );
    });

    it('renders optional Entry @author tag', () => {
      const defaultRenderer = new DefaultContentTypeRenderer();
      defaultRenderer.setup(project);

      // @ts-ignore
      mockContentType.sys.createdBy = {
        sys: {
          id: '<user-id>',
        },
      };

      defaultRenderer.render(mockContentType, testFile);

      const docsRenderer = new JsDocRenderer();
      docsRenderer.render(mockContentType, testFile);

      expect('\n' + testFile.getFullText()).toEqual(
        stripIndent(`
        import * as Contentful from "contentful";
        
        /**
         * Fields type definition for content type 'TypeAnimalFields'
         * @name TypeAnimalFields
         * @type {TypeAnimalFields}
         * @memberof TypeAnimal
         */
        export interface TypeAnimalFields {
            bread: Contentful.EntryFields.Symbol;
        }
        
        /**
         * Entry type definition for content type 'animal' (Animal)
         * @name TypeAnimal
         * @type {TypeAnimal}
         * @author <user-id>
         */
        export type TypeAnimal = Contentful.Entry<TypeAnimalFields>;
        `),
      );
    });

    it('renders optional Entry @version tag', () => {
      const defaultRenderer = new DefaultContentTypeRenderer();
      defaultRenderer.setup(project);

      // @ts-ignore
      mockContentType.sys.publishedVersion = 5;

      defaultRenderer.render(mockContentType, testFile);

      const docsRenderer = new JsDocRenderer();
      docsRenderer.render(mockContentType, testFile);

      expect('\n' + testFile.getFullText()).toEqual(
        stripIndent(`
        import * as Contentful from "contentful";
        
        /**
         * Fields type definition for content type 'TypeAnimalFields'
         * @name TypeAnimalFields
         * @type {TypeAnimalFields}
         * @memberof TypeAnimal
         */
        export interface TypeAnimalFields {
            bread: Contentful.EntryFields.Symbol;
        }
        
        /**
         * Entry type definition for content type 'animal' (Animal)
         * @name TypeAnimal
         * @type {TypeAnimal}
         * @version 5
         */
        export type TypeAnimal = Contentful.Entry<TypeAnimalFields>;
        `),
      );
    });

    it('renders optional Entry @since tag', () => {
      const defaultRenderer = new DefaultContentTypeRenderer();
      defaultRenderer.setup(project);

      // @ts-ignore
      mockContentType.sys.firstPublishedAt = '1675420727';

      defaultRenderer.render(mockContentType, testFile);

      const docsRenderer = new JsDocRenderer();
      docsRenderer.render(mockContentType, testFile);

      expect('\n' + testFile.getFullText()).toEqual(
        stripIndent(`
        import * as Contentful from "contentful";
        
        /**
         * Fields type definition for content type 'TypeAnimalFields'
         * @name TypeAnimalFields
         * @type {TypeAnimalFields}
         * @memberof TypeAnimal
         */
        export interface TypeAnimalFields {
            bread: Contentful.EntryFields.Symbol;
        }
        
        /**
         * Entry type definition for content type 'animal' (Animal)
         * @name TypeAnimal
         * @type {TypeAnimal}
         * @since 1675420727
         */
        export type TypeAnimal = Contentful.Entry<TypeAnimalFields>;
        `),
      );
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

      expect('\n' + testFile.getFullText()).toEqual(
        stripIndent(`
        import * as Contentful from "contentful";
        
        /**
         * Fields type definition for content type 'TypeAnimalFields'
         * @name TypeAnimalFields
         * @type {TypeAnimalFields}
         * @memberof TypeAnimal
         */
        export interface TypeAnimalFields {
            bread: Contentful.EntryFields.Symbol;
        }
        
        /** Custom entry description */
        export type TypeAnimal = Contentful.Entry<TypeAnimalFields>;
        `),
      );
    });
  });
});
