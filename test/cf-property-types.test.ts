import {expect} from '@oclif/test';
import {propertyType} from '../src/cf-property-types';

describe('A propertyType function', () => {
    it('can evaluate an "Symbol" type', () => {
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

        expect(propertyType(field)).to.equal('Contentful.EntryFields.Symbol');
    });

    it('can evaluate an "Symbol" type with "in" validation', () => {
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

        expect(propertyType(field)).to.equal('"Left-aligned" | "Center-aligned"');
    });

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

        expect(propertyType(field)).to.equal('Contentful.Entry<TopicCategoryFields>');
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

        expect(propertyType(field)).to.equal('Contentful.EntryFields.Symbol[]');
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

        expect(propertyType(field)).to.equal('("Feature" | "Benefit" | "Tech spec" | "Other")[]');
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

        expect(propertyType(field)).to.equal('Contentful.Entry<ComponentCtaFields | ComponentFaqFields | WrapperImageFields | WrapperVideoFields>[]');
    });
});
