import { renderTypeLiteral } from '../../../src/renderer/generic/render-type-literal';

describe('A renderTypeLiteral function', () => {
    it('renders a plain string', () => {
        expect(renderTypeLiteral('foo')).toEqual('"foo"');
    });
    it('renders a string with an escapable character', () => {
        expect(renderTypeLiteral('foo\nbar')).toEqual('"foo\\nbar"');
    });    
});