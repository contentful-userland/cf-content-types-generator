import { createContext, propertyImports } from '../src';

describe('propertyImports', () => {
  it('returns skeleton imports for referenced entries', () => {
    const field = JSON.parse(`
      {
        "id": "category",
        "name": "Category",
        "type": "Link",
        "localized": false,
        "required": true,
        "validations": [
          {
            "linkContentType": [
              "topicCategory"
            ]
          }
        ],
        "disabled": false,
        "omitted": false,
        "linkType": "Entry"
      }
    `);

    expect(propertyImports(field, createContext())).toEqual([
      {
        moduleSpecifier: './TypeTopicCategory',
        namedImports: ['TypeTopicCategorySkeleton'],
        isTypeOnly: true,
      },
    ]);
  });

  it('returns empty for scalar fields', () => {
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

    expect(propertyImports(field, createContext())).toEqual([]);
  });
});
