import { Project, ScriptTarget, SourceFile } from 'ts-morph';
import { CFContentType, DefaultContentTypeRenderer, TypeGuardRenderer } from '../../../src';
import stripIndent = require('strip-indent');

describe('A content type type guard renderer class', () => {
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

  describe('with default content type declarations', () => {
    it('renders entry type guard', () => {
      const defaultRenderer = new DefaultContentTypeRenderer();
      defaultRenderer.setup(project);
      defaultRenderer.render(mockContentType, testFile);

      const typeGuardRenderer = new TypeGuardRenderer();
      typeGuardRenderer.render(mockContentType, testFile);

      expect('\n' + testFile.getFullText()).toEqual(
        stripIndent(`
        import type { Entry, EntryFields } from "contentful";
        import type { WithContentTypeLink } from "./WithContentTypeLink";
        
        export interface TypeAnimalFields {
            bread: EntryFields.Symbol;
        }
        
        export type TypeAnimal = Entry<TypeAnimalFields>;
        
        export function isTypeAnimal(entry: WithContentTypeLink): entry is TypeAnimal {
            return entry.sys.contentType.sys.id === 'animal'
        }
        `),
      );
    });

    it('creates type guard helper types', () => {
      const typeGuardRenderer = new TypeGuardRenderer();
      typeGuardRenderer.setup(project);
      typeGuardRenderer.render(mockContentType, testFile);
      const typeGuardFile = project.getSourceFiles()[1];

      expect('\n' + typeGuardFile.getFullText()).toEqual(
        stripIndent(`
        export type WithContentTypeLink = { sys: { contentType: { sys: { id: string } } } };
        `),
      );
    });
  });
});
