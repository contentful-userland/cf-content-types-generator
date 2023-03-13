import { createDefaultContext, renderRichText } from '../../../src';

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

    expect(result).toEqual('CFRichTextTypes.RichText');

    expect([...context.imports.values()]).toEqual([
      {
        moduleSpecifier: '@contentful/rich-text-types',
        namespaceImport: 'CFRichTextTypes',
        isTypeOnly: true,
      },
    ]);
  });
});
