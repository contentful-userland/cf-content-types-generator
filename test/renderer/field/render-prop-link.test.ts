import { createContext, renderPropLink } from '../../../src';

describe('renderPropLink', () => {
  it('renders linked entry skeleton references', () => {
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

    expect(renderPropLink(field, createContext())).toEqual(
      'EntryFieldTypes.EntryLink<TypeTopicCategorySkeleton>',
    );
  });

  it('falls back to EntrySkeletonType without validations', () => {
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

    expect(renderPropLink(field, createContext())).toEqual(
      'EntryFieldTypes.EntryLink<EntrySkeletonType>',
    );
  });
});
