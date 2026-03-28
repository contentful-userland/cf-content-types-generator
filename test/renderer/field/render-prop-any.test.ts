import { createContext, RenderContext, renderPropAny } from '../../../src';

describe('renderPropAny', () => {
  let context: RenderContext;

  beforeEach(() => {
    context = createContext();
  });

  it('renders modern scalar field types', () => {
    const field = JSON.parse(`
      {
        "id": "internalName",
        "name": "Internal name",
        "type": "Symbol",
        "localized": false,
        "required": false,
        "validations": [],
        "disabled": false,
        "omitted": false
      }
    `);

    expect(renderPropAny(field, context)).toEqual('EntryFieldTypes.Symbol');
  });

  it('renders validation-constrained scalar field types', () => {
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

    expect(renderPropAny(field, context)).toEqual(
      'EntryFieldTypes.Symbol<"Center-aligned" | "Left-aligned">',
    );
  });
});
