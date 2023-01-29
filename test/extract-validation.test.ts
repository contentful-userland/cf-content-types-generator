import { linkContentTypeValidations } from '../src';

describe('A linkContentTypeValidations function', () => {
  it('parses empty validations', () => {
    const field = { validations: [] };
    expect(linkContentTypeValidations(field)).toEqual([]);
  });

  it('parses empty linked content type', () => {
    const field = { validations: [{ linkContentType: [] }] };
    expect(linkContentTypeValidations(field)).toEqual([]);
  });

  it('parses single linked content type', () => {
    const field = { validations: [{ linkContentType: ['topicCategory'] }] };
    expect(linkContentTypeValidations(field)).toEqual(['topicCategory']);
  });

  it('parses multiple linked content types', () => {
    const field = { validations: [{ linkContentType: ['topicA', 'topicB'] }] };
    expect(linkContentTypeValidations(field)).toEqual(['topicA', 'topicB']);
  });
});
