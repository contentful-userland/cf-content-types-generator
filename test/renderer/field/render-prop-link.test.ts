import {
  createDefaultContext,
  createV10Context,
  renderPropLink,
  renderPropLinkV10,
} from '../../../src';

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

    expect(renderPropLink(field, createDefaultContext())).toBe('Entry<TypeTopicCategoryFields>');
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

    expect(renderPropLink(field, createDefaultContext())).toBe('Entry<Record<string, any>>');
  });
});

describe('A renderPropLinkV10 function', () => {
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

    expect(renderPropLinkV10(field, createV10Context())).toBe(
      'EntryFieldTypes.EntryLink<TypeTopicCategorySkeleton>',
    );
  });

  it('can evaluate a "Link" type with multiple linked content types', () => {
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
                "topicCategoryA",
                "topicCategoryB"
              ]
            }
          ],
          "disabled": false,
          "omitted": false,
          "linkType": "Entry"
        }
        `);

    expect(renderPropLinkV10(field, createV10Context())).toBe(
      'EntryFieldTypes.EntryLink<TypeTopicCategoryASkeleton | TypeTopicCategoryBSkeleton>',
    );
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

    expect(renderPropLinkV10(field, createV10Context())).toBe(
      'EntryFieldTypes.EntryLink<EntrySkeletonType>',
    );
  });
});
