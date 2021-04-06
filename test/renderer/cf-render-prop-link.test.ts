import { defaultRenderers, renderPropLink } from '../../src/type-renderer';
import {expect} from '@oclif/test';
import {moduleFieldsName, moduleName} from '../../src/utils';
import { FieldType } from 'contentful';
import { FieldRenderer } from '../../src/renderer/render-types';

const defaultContext = {
  moduleName,
  moduleFieldsName,
  getRenderer: <FType extends FieldType>(fieldType: FType) => defaultRenderers[fieldType] as FieldRenderer<FType>,
}

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

        expect(renderPropLink(field, defaultContext)).to.equal('Contentful.Entry<TypeTopicCategoryFields>');
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

      expect(renderPropLink(field, defaultContext)).to.equal('Contentful.Entry<Record<string, any>>');
    });

});
