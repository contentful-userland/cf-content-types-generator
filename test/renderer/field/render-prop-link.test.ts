import { createDefaultContext, renderPropLink } from '../../../src';

describe('A renderPropLink function', () => {
  it('can evaluate a "Link" type', () => {
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

    expect(renderPropLink(field, createDefaultContext())).toEqual('Entry<TypeTopicCategoryFields>');
  });

  it('can evaluate a "Link" type with no validations', () => {
    const field = JSON.parse(`
      {
        "id": "components",
        "name": "Components",
        "type": "Link",
        "localized": false,
        "required": true,
        "validations": [],
        "disabled": false,
        "omitted": false,
        "linkType": "Entry"
      }
      `);

    expect(renderPropLink(field, createDefaultContext())).toEqual('Entry<Record<string, any>>');
  });
});
