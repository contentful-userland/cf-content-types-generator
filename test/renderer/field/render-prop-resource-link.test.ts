import { createContext, renderPropResourceLink } from '../../../src';

describe('renderPropResourceLink', () => {
  it('renders cross-space entry resource links', () => {
    const field = JSON.parse(`
      {
        "id": "category",
        "name": "Category",
        "type": "ResourceLink",
        "localized": false,
        "required": true,
        "validations": [],
        "disabled": false,
        "omitted": false,
        "allowedResources": [
          {
            "type": "Contentful:Entry",
            "source": "crn:contentful:::content:spaces/spaceId",
            "contentTypes": [
              "topicCategory"
            ]
          }
        ]
      }
    `);

    expect(renderPropResourceLink(field, createContext())).toEqual(
      'EntryFieldTypes.EntryResourceLink<EntrySkeletonType>',
    );
  });

  it('renders mixed Contentful and external resource links', () => {
    const field = JSON.parse(`
      {
        "id": "category",
        "name": "Category",
        "type": "ResourceLink",
        "localized": false,
        "required": true,
        "validations": [],
        "disabled": false,
        "omitted": false,
        "allowedResources": [
          {
            "type": "Contentful:Entry",
            "source": "crn:contentful:::content:spaces/spaceId"
          },
          {
            "type": "ExternalProvider:ExternalReference"
          }
        ]
      }
    `);

    expect(renderPropResourceLink(field, createContext())).toEqual(
      'EntryFieldTypes.EntryResourceLink<EntrySkeletonType> | EntryFieldTypes.ExternalResourceLink',
    );
  });

  it('renders external-only resource links', () => {
    const field = JSON.parse(`
      {
        "id": "category",
        "name": "Category",
        "type": "ResourceLink",
        "localized": false,
        "required": true,
        "validations": [],
        "disabled": false,
        "omitted": false,
        "allowedResources": [
          {
            "type": "ExternalProvider:ExternalReference"
          }
        ]
      }
    `);

    expect(renderPropResourceLink(field, createContext())).toEqual(
      'EntryFieldTypes.ExternalResourceLink',
    );
  });

  it('rejects unknown cross-space resource types', () => {
    const field = JSON.parse(`
      {
        "id": "category",
        "name": "Category",
        "type": "ResourceLink",
        "localized": false,
        "required": true,
        "validations": [],
        "disabled": false,
        "omitted": false,
        "allowedResources": [
          {
            "type": "Contentful:UnknownEntity",
            "source": "crn:contentful:::content:spaces/spaceId"
          }
        ]
      }
    `);

    expect(() => renderPropResourceLink(field, createContext())).toThrow(
      'Unknown type "Contentful:UnknownEntity"',
    );
  });
});
