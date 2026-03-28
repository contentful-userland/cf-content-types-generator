import { Project, ScriptTarget, SourceFile } from 'ts-morph';
import { CFContentType, ContentTypeRenderer, TypeGuardRenderer } from '../../../src';
import stripIndent = require('strip-indent');

describe('TypeGuardRenderer', () => {
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

  it('renders modern type guards', () => {
    const contentTypeRenderer = new ContentTypeRenderer();
    contentTypeRenderer.render(mockContentType, testFile);

    const typeGuardRenderer = new TypeGuardRenderer();
    typeGuardRenderer.render(mockContentType, testFile);

    expect(('\n' + testFile.getFullText()).trim()).toEqual(
      stripIndent(`
        import type { ChainModifiers, Entry, EntryFieldTypes, EntrySkeletonType, LocaleCode } from "contentful";

        export interface TypeAnimalFields {
            breed: EntryFieldTypes.Symbol;
        }

        export type TypeAnimalSkeleton = EntrySkeletonType<TypeAnimalFields, "animal">;
        export type TypeAnimal<Modifiers extends ChainModifiers, Locales extends LocaleCode = LocaleCode> = Entry<TypeAnimalSkeleton, Modifiers, Locales>;

        export function isTypeAnimal<Modifiers extends ChainModifiers, Locales extends LocaleCode>(entry: unknown): entry is TypeAnimal<Modifiers, Locales> {
            const candidate = entry as { sys?: { contentType?: { sys?: { id?: string } } } };
            return candidate.sys?.contentType?.sys?.id === 'animal'
        }
      `).trim(),
    );
  });
});
