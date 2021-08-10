import {renderPropLink} from '../../../src/renderer/field';
import {expect} from '@oclif/test';
import {createDefaultContext} from "../../../src/renderer/type";

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

        expect(renderPropLink(field, createDefaultContext())).to.equal('Contentful.Entry<TypeTopicCategoryFields>');
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

      expect(renderPropLink(field, createDefaultContext())).to.equal('Contentful.Entry<Record<string, any>>');
    });

});
