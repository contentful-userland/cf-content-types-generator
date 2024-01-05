import { propertyImports, createDefaultContext } from '../src';

describe('A typeImports function', () => {
  it('returns imports for referenced Entry', () => {
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
    expect(propertyImports(field, createDefaultContext())).toEqual([
      {
        moduleSpecifier: './TypeTopicCategory',
        namedImports: ['TypeTopicCategoryFields'],
        isTypeOnly: true,
      },
    ]);
  });

  it('returns empty for symbol field', () => {
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
    expect(propertyImports(field, createDefaultContext())).toEqual([]);
  });
  it('returns imports for referenced Entry without validations', () => {
    const field = JSON.parse(`
        {
          "id": "category",
          "name": "Category",
          "type": "Link",
          "localized": false,
          "required": true,
          "validations": [],
          "disabled": false,
          "omitted": false,
          "linkType": "Entry"
        }
        `);
    expect(propertyImports(field, createDefaultContext())).toEqual([
      {
        moduleSpecifier: './TypeCategory',
        namedImports: ['TypeCategoryFields'],
        isTypeOnly: true,
      },
    ]);
  });
});
