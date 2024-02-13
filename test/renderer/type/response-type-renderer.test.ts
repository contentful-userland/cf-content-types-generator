import { Project, ScriptTarget, SourceFile } from 'ts-morph';
import { CFContentType } from '../../../src';
import { ResponseTypeRenderer } from '../../../src/renderer/type/response-type-renderer';
import stripIndent = require('strip-indent');

describe('A response type renderer class', () => {
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

  it('adds response types', () => {
    const renderer = new ResponseTypeRenderer();
    renderer.setup(project);

    const contentType: CFContentType = {
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
    };

    renderer.render(contentType, testFile);

    expect(testFile.getFullText()).toEqual(
      stripIndent(
        `
              export type TypeTestWithoutLinkResolutionResponse = TypeTest<"WITHOUT_LINK_RESOLUTION">;
              export type TypeTestWithoutUnresolvableLinksResponse = TypeTest<"WITHOUT_UNRESOLVABLE_LINKS">;
              export type TypeTestWithAllLocalesResponse<Locales extends LocaleCode = LocaleCode> = TypeTest<"WITH_ALL_LOCALES", Locales>;
              export type TypeTestWithAllLocalesAndWithoutLinkResolutionResponse<Locales extends LocaleCode = LocaleCode> = TypeTest<"WITHOUT_LINK_RESOLUTION" | "WITH_ALL_LOCALES", Locales>;
              export type TypeTestWithAllLocalesAndWithoutUnresolvableLinksResponse<Locales extends LocaleCode = LocaleCode> = TypeTest<"WITHOUT_UNRESOLVABLE_LINKS" | "WITH_ALL_LOCALES", Locales>;
              `,
      )
        .replace(/.*/, '')
        .slice(1),
    );
  });
});
