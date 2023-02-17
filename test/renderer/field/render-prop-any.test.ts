import { createDefaultContext, RenderContext, renderPropAny } from '../../../src';

describe('A renderPropAny function', () => {
  let context: RenderContext;

  beforeEach(() => {
    context = createDefaultContext();
  });

  it('can evaluate a "Symbol" type', () => {
    const field = JSON.parse(`
        {
          "id": "internalName",
          "name": "Internal name",
          "type": "Symbol",
          "localized": false,
          "required": false,
          "validations": [
          ],
          "disabled": false,
          "omitted": false
        }
        `);

    expect(renderPropAny(field, context)).toEqual('EntryFields.Symbol');
  });

  it('can evaluate a "Symbol" type with "in" validation', () => {
    const field = JSON.parse(`
        {
          "id": "headerAlignment",
          "name": "Header alignment",
          "type": "Symbol",
          "localized": false,
          "required": false,
          "validations": [
            {
              "in": [
                "Left-aligned",
                "Center-aligned"
              ]
            }
          ],
          "disabled": false,
          "omitted": false
        }
        `);

    expect(renderPropAny(field, context)).toEqual('"Center-aligned" | "Left-aligned"');
  });

  it('can evaluate a "Symbol" type with missing validations', () => {
    const field = JSON.parse(`
      {
        "id": "internalName",
        "name": "Internal name",
        "type": "Symbol",
        "localized": false,
        "required": false,
        "disabled": false,
        "omitted": false
      }
      `);

    expect(renderPropAny(field, context)).toEqual('EntryFields.Symbol');
  });
});
