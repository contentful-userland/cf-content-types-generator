import { createDefaultContext, renderRichText, renderRichTextV10 } from '../../../src';

describe('A renderPropRichText function', () => {
  it('can evaluate a "RichText" type', () => {
    const field = JSON.parse(`
        {
          "id": "info",
          "name": "Info",
          "type": "RichText",
          "localized": false,
          "required": true,
          "validations": [],
          "disabled": false,
          "omitted": false
        }
        `);

    const context = createDefaultContext();
    const result = renderRichText(field, context);

    expect(result).toBe('EntryFields.RichText');

    expect([...context.imports.values()]).toEqual([
      {
        moduleSpecifier: 'contentful',
        namedImports: ['EntryFields'],
        isTypeOnly: true,
      },
    ]);
  });
});

describe('A renderPropRichTextV10 function', () => {
  it('can evaluate a "RichText" type', () => {
    const field = JSON.parse(`
        {
          "id": "info",
          "name": "Info",
          "type": "RichText",
          "localized": false,
          "required": true,
          "validations": [],
          "disabled": false,
          "omitted": false
        }
        `);

    const context = createDefaultContext();
    const result = renderRichTextV10(field, context);

    expect(result).toBe('EntryFieldTypes.RichText');

    expect([...context.imports.values()]).toEqual([
      {
        moduleSpecifier: 'contentful',
        namedImports: ['EntryFieldTypes'],
        isTypeOnly: true,
      },
    ]);
  });
});
