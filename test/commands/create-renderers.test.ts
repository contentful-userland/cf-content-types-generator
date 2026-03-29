import { createRenderers } from '../../src/cli/create-renderers';
import {
  ContentTypeRenderer,
  JsDocRenderer,
  ResponseTypeRenderer,
  TypeGuardRenderer,
} from '../../src';

const throwOnError = (message: string): never => {
  throw new Error(message);
};

describe('createRenderers', () => {
  it('uses modern output by default', () => {
    const renderers = createRenderers({}, throwOnError);

    expect(renderers).toHaveLength(1);
    expect(renderers[0]).toBeInstanceOf(ContentTypeRenderer);
  });

  it('adds optional modern renderers', () => {
    const renderers = createRenderers(
      {
        jsdoc: true,
        typeguard: true,
        response: true,
      },
      throwOnError,
    );

    expect(renderers[0]).toBeInstanceOf(ContentTypeRenderer);
    expect(renderers[1]).toBeInstanceOf(JsDocRenderer);
    expect(renderers[2]).toBeInstanceOf(TypeGuardRenderer);
    expect(renderers[3]).toBeInstanceOf(ResponseTypeRenderer);
  });

  it('rejects removed --v10', () => {
    expect(() => createRenderers({ v10: true }, throwOnError)).toThrow(
      '"--v10" was removed. v10+ output is now the default and only output.',
    );
  });

  it('rejects removed --localized', () => {
    expect(() => createRenderers({ localized: true }, throwOnError)).toThrow(
      '"--localized" was removed. Localization support is built into the default output.',
    );
  });
});
