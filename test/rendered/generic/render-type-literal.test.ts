import { renderTypeLiteral } from '../../../src/renderer/generic/render-type-literal';

describe('A renderTypeLiteral function', () => {
  it('renders a plain string', () => {
    expect(renderTypeLiteral('foo')).toEqual('"foo"');
  });
  it('renders a string with an escapable character', () => {
    expect(renderTypeLiteral('foo\nbar')).toEqual('"foo\\nbar"');
  });
  it('renders the string "undefined" as the literal undefined', () => {
    expect(renderTypeLiteral('undefined')).toEqual('undefined');
  });
  it('renders the string "null" as the literal null', () => {
    expect(renderTypeLiteral('null')).toEqual('null');
  });
});
