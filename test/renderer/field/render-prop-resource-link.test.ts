import {
  createDefaultContext,
  renderPropResourceLink,
  renderPropResourceLinkV10,
} from '../../../src';

describe('A renderPropResourceLink function', () => {
  it('can evaluate a "ResourceLink" type', () => {
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

    expect(renderPropResourceLink(field, createDefaultContext())).toEqual(
      'Entry<Record<string, any>>',
    );
  });

  it('rejects a "ResourceLink" with an unknown resource type', () => {
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
              "source": "crn:contentful:::content:spaces/spaceId",
                "contentTypes": [
                "topicCategory"
              ]
            }
          ]
         }
      `);

    expect(() => renderPropResourceLink(field, createDefaultContext())).toThrow(
      'Unknown type "Contentful:UnknownEntity"',
    );
  });
});

describe('A renderPropResourceLinkV10 function', () => {
  it('can evaluate a "ResourceLink" type', () => {
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

    expect(renderPropResourceLinkV10(field, createDefaultContext())).toEqual(
      'EntryFieldTypes.EntryResourceLink<EntrySkeletonType>',
    );
  });

  it('rejects a "ResourceLink" with an unknown resource type', () => {
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
              "source": "crn:contentful:::content:spaces/spaceId",
                "contentTypes": [
                "topicCategory"
              ]
            }
          ]
         }
      `);

    expect(() => renderPropResourceLinkV10(field, createDefaultContext())).toThrow(
      'Unknown type "Contentful:UnknownEntity"',
    );
  });
});
