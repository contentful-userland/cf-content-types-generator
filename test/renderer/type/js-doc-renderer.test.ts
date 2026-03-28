import { Project, ScriptTarget, SourceFile } from 'ts-morph';
import { CFContentType, ContentTypeRenderer, JsDocRenderer } from '../../../src';
import stripIndent = require('strip-indent');

describe('JsDocRenderer', () => {
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
          id: 'breed',
          name: 'Breed',
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

  it('adds JSDoc to modern content types and skeletons', () => {
    const contentTypeRenderer = new ContentTypeRenderer();
    contentTypeRenderer.render(mockContentType, testFile);

    const docsRenderer = new JsDocRenderer();
    docsRenderer.render(mockContentType, testFile);

    expect(('\n' + testFile.getFullText()).trim()).toEqual(
      stripIndent(`
        import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

        /**
         * Fields type definition for content type 'TypeAnimal'
         * @name TypeAnimalFields
         * @type {TypeAnimalFields}
         * @memberof TypeAnimal
         */
        export interface TypeAnimalFields {
            /**
             * Field type definition for field 'breed' (Breed)
             * @name Breed
             * @localized false
             */
            breed: EntryFieldTypes.Symbol;
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
        export type TypeAnimal<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeAnimalSkeleton, Modifiers, Locales>;
      `).trim(),
    );
  });

  it('includes optional metadata tags', () => {
    // @ts-expect-error test fixture keeps sys loose on purpose
    mockContentType.sys.createdBy = { sys: { id: '<user-id>' } };
    // @ts-expect-error test fixture keeps sys loose on purpose
    mockContentType.sys.publishedVersion = 5;

    const contentTypeRenderer = new ContentTypeRenderer();
    contentTypeRenderer.render(mockContentType, testFile);

    const docsRenderer = new JsDocRenderer();
    docsRenderer.render(mockContentType, testFile);

    expect(testFile.getFullText()).toContain('* @author <user-id>');
    expect(testFile.getFullText()).toContain('* @version 5');
  });
});
