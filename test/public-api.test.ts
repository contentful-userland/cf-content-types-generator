import * as api from '../src';

describe('public API', () => {
  it('exports canonical modern renderers', () => {
    expect(api).toHaveProperty('ContentTypeRenderer');
    expect(api).toHaveProperty('TypeGuardRenderer');
    expect(api).toHaveProperty('ResponseTypeRenderer');
    expect(api).toHaveProperty('JsDocRenderer');
    expect(api).toHaveProperty('createContext');
    expect(api).toHaveProperty('renderers');
  });

  it('does not export removed classic APIs', () => {
    expect(api).not.toHaveProperty('DefaultContentTypeRenderer');
    expect(api).not.toHaveProperty('LocalizedContentTypeRenderer');
    expect(api).not.toHaveProperty('V10ContentTypeRenderer');
    expect(api).not.toHaveProperty('V10TypeGuardRenderer');
    expect(api).not.toHaveProperty('createDefaultContext');
    expect(api).not.toHaveProperty('createV10Context');
    expect(api).not.toHaveProperty('defaultRenderers');
    expect(api).not.toHaveProperty('v10Renderers');
  });
});
