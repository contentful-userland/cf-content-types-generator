import { createContext, renderRichText } from '../../../src';

describe('renderRichText', () => {
  it('renders the modern rich text type', () => {
    const field = JSON.parse(`
      {
        "id": "body",
        "name": "Body",
        "type": "RichText",
        "localized": false,
        "required": false,
        "validations": [],
        "disabled": false,
        "omitted": false
      }
    `);

    expect(renderRichText(field, createContext())).toEqual('EntryFieldTypes.RichText');
  });
});
