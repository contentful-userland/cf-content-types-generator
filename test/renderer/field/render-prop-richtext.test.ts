import {renderRichText} from '../../../src/renderer/field';
import {expect} from '@oclif/test';
import {createDefaultContext} from "../../../src/renderer/type";

describe('A renderPropRichText function', () => {
    it('can evaluate a "RichText" type', () => {
        const field = JSON.parse(`
        {
          "id": "info",
          "name": "Info",
          "type": "RichText",
          "localized": false,
          "required": true,
          "validations": [],
          "disabled": false,
          "omitted": false
        }
        `);

        const context = createDefaultContext();
        const result = renderRichText(field, context);

        expect(result).to.equal('CFRichTextTypes.Block | CFRichTextTypes.Inline');

        expect([...context.imports.values()]).to.eql([{
            moduleSpecifier: '@contentful/rich-text-types',
            namespaceImport: 'CFRichTextTypes',
        }])
    });
});
