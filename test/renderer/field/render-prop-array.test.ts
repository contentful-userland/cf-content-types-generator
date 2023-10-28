import {
  createDefaultContext,
  createV10Context,
  renderPropArray,
  renderPropArrayV10,
} from '../../../src';

describe('A renderPropArray function', () => {
  it('can evaluate a "Array" of "Link" with no validations', () => {
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
          "validations": [],
          "linkType": "Entry"
        }
      }
      `);

    expect(renderPropArray(field, createDefaultContext())).toBe('Entry<Record<string, any>>[]');
  });

  it('can evaluate an "Array" of "Symbol"', () => {
    const field = JSON.parse(`
        {
          "id": "tags",
          "name": "Tags (optional)",
          "type": "Array",
          "localized": false,
          "required": false,
          "validations": [
          ],
          "disabled": false,
          "omitted": false,
          "items": {
            "type": "Symbol",
            "validations": [
            ]
          }
        }
        `);

    expect(renderPropArray(field, createDefaultContext())).toBe('EntryFields.Symbol[]');
  });

  it('can evaluate an "Array" of "Symbol" with "in" validation', () => {
    const field = JSON.parse(`
        {
          "id": "category",
          "name": "Category (optional)",
          "type": "Array",
          "localized": false,
          "required": false,
          "validations": [
          ],
          "disabled": false,
          "omitted": false,
          "items": {
            "type": "Symbol",
            "validations": [
              {
                "in": [
                  "Feature",
                  "Benefit",
                  "Tech spec",
                  "Other"
                ]
              }
            ]
          }
        }
        `);

    expect(renderPropArray(field, createDefaultContext())).toBe(
      '("Benefit" | "Feature" | "Other" | "Tech spec")[]',
    );
  });

  it('can evaluate an "Array" of "Link" with "linkContentType" validation', () => {
    const field = JSON.parse(`
        {
          "id": "extraSections",
          "name": "Extra sections (optional)",
          "type": "Array",
          "localized": false,
          "required": false,
          "validations": [
          ],
          "disabled": false,
          "omitted": false,
          "items": {
            "type": "Link",
            "validations": [
              {
                "linkContentType": [
                  "componentCta",
                  "componentFaq",
                  "wrapperImage",
                  "wrapperVideo"
                ]
              }
            ],
            "linkType": "Entry"
          }
        }
        `);

    expect(renderPropArray(field, createDefaultContext())).toBe(
      'Entry<TypeComponentCtaFields | TypeComponentFaqFields | TypeWrapperImageFields | TypeWrapperVideoFields>[]',
    );
  });

  it('can evaluate a "Array" of "ResourceLink"', () => {
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
          "type": "ResourceLink",
          "validations": []
        },
        "allowedResources": [
          {
            "type": "Contentful:Entry",
            "source": "crn:contentful:::content:spaces/spaceId",
            "contentTypes": [
              "componentCta",
              "componentFaq",
              "wrapperImage",
              "wrapperVideo"
            ]
          }
        ]
      }
    `);

    expect(renderPropArray(field, createDefaultContext())).toBe('Entry<Record<string, any>>[]');
  });
});

describe('A renderPropArrayV10 function', () => {
  it('can evaluate a "Array" of "Link" with no validations', () => {
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
          "validations": [],
          "linkType": "Entry"
        }
      }
      `);

    expect(renderPropArrayV10(field, createV10Context())).toBe(
      'EntryFieldTypes.Array<EntryFieldTypes.EntryLink<EntrySkeletonType>>',
    );
  });

  it('can evaluate an "Array" of "Symbol"', () => {
    const field = JSON.parse(`
        {
          "id": "tags",
          "name": "Tags (optional)",
          "type": "Array",
          "localized": false,
          "required": false,
          "validations": [
          ],
          "disabled": false,
          "omitted": false,
          "items": {
            "type": "Symbol",
            "validations": [
            ]
          }
        }
        `);

    expect(renderPropArrayV10(field, createV10Context())).toBe(
      'EntryFieldTypes.Array<EntryFieldTypes.Symbol>',
    );
  });

  it('can evaluate an "Array" of "Symbol" with "in" validation', () => {
    const field = JSON.parse(`
        {
          "id": "category",
          "name": "Category (optional)",
          "type": "Array",
          "localized": false,
          "required": false,
          "validations": [
          ],
          "disabled": false,
          "omitted": false,
          "items": {
            "type": "Symbol",
            "validations": [
              {
                "in": [
                  "Feature",
                  "Benefit",
                  "Tech spec",
                  "Other"
                ]
              }
            ]
          }
        }
        `);

    expect(renderPropArrayV10(field, createV10Context())).toBe(
      'EntryFieldTypes.Array<EntryFieldTypes.Symbol<"Benefit" | "Feature" | "Other" | "Tech spec">>',
    );
  });

  it('can evaluate an "Array" of "Link" with "linkContentType" validation', () => {
    const field = JSON.parse(`
        {
          "id": "extraSections",
          "name": "Extra sections (optional)",
          "type": "Array",
          "localized": false,
          "required": false,
          "validations": [
          ],
          "disabled": false,
          "omitted": false,
          "items": {
            "type": "Link",
            "validations": [
              {
                "linkContentType": [
                  "componentCta",
                  "componentFaq",
                  "wrapperImage",
                  "wrapperVideo"
                ]
              }
            ],
            "linkType": "Entry"
          }
        }
        `);

    expect(renderPropArrayV10(field, createV10Context())).toBe(
      'EntryFieldTypes.Array<EntryFieldTypes.EntryLink<TypeComponentCtaSkeleton | TypeComponentFaqSkeleton | TypeWrapperImageSkeleton | TypeWrapperVideoSkeleton>>',
    );
  });

  it('can evaluate a "Array" of "ResourceLink"', () => {
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
          "type": "ResourceLink",
          "validations": []
        },
        "allowedResources": [
          {
            "type": "Contentful:Entry",
            "source": "crn:contentful:::content:spaces/spaceId",
            "contentTypes": [
              "componentCta",
              "componentFaq",
              "wrapperImage",
              "wrapperVideo"
            ]
          }
        ]
      }
    `);

    expect(renderPropArrayV10(field, createV10Context())).toBe(
      'EntryFieldTypes.Array<EntryFieldTypes.EntryResourceLink<EntrySkeletonType>>',
    );
  });
});
