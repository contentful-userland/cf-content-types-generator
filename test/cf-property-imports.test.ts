import {expect} from '@oclif/test';
import {typeImports} from '../src/cf-property-imports';

describe('A typeImports function', () => {
    it('returns for port referenced Entry', () => {
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
        expect(typeImports(field)).to.eql([{
            moduleSpecifier: './TopicCategory',
            namedImports: ['TopicCategoryFields'],
        }]);
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
        expect(typeImports(field)).to.eql([]);
    });
});
