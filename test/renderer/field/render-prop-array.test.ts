import { createContext, renderPropArray } from '../../../src';

describe('renderPropArray', () => {
  it('renders arrays of linked entry skeletons', () => {
    const field = JSON.parse(`
      {
        "id": "components",
        "name": "Components",
        "type": "Array",
        "localized": false,
        "required": true,
        "validations": [],
        "disabled": false,
        "omitted": false,
        "items": {
          "type": "Link",
          "validations": [
            {
              "linkContentType": [
                "topicCategory"
              ]
            }
          ],
          "linkType": "Entry"
        }
      }
    `);

    expect(renderPropArray(field, createContext())).toEqual(
      'EntryFieldTypes.Array<EntryFieldTypes.EntryLink<TypeTopicCategorySkeleton>>',
    );
  });

  it('renders validated symbol arrays', () => {
    const field = JSON.parse(`
      {
        "id": "labels",
        "name": "Labels",
        "type": "Array",
        "localized": false,
        "required": false,
        "validations": [],
        "disabled": false,
        "omitted": false,
        "items": {
          "type": "Symbol",
          "validations": [
            {
              "in": [
                "left",
                "right"
              ]
            }
          ]
        }
      }
    `);

    expect(renderPropArray(field, createContext())).toEqual(
      'EntryFieldTypes.Array<EntryFieldTypes.Symbol<"left" | "right">>',
    );
  });
});
