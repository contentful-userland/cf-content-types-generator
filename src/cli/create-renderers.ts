import {
  ContentTypeRenderer,
  JsDocRenderer,
  Renderer,
  ResponseTypeRenderer,
  TypeGuardRenderer,
} from '../renderer';

export type RendererFlags = {
  v10?: boolean;
  localized?: boolean;
  jsdoc?: boolean;
  typeguard?: boolean;
  response?: boolean;
  modifiers?: string[];
};

export const createRenderers = (
  flags: RendererFlags,
  onError: (message: string) => never,
): Renderer[] => {
  if (flags.v10) {
    onError('"--v10" was removed. v10+ output is now the default and only output.');
  }

  if (flags.localized) {
    onError('"--localized" was removed. Localization support is built into the default output.');
  }

  const renderers: Renderer[] = [new ContentTypeRenderer({ defaultModifiers: flags.modifiers })];

  if (flags.jsdoc) {
    renderers.push(new JsDocRenderer());
  }

  if (flags.typeguard) {
    renderers.push(new TypeGuardRenderer());
  }

  if (flags.response) {
    renderers.push(new ResponseTypeRenderer());
  }

  return renderers;
};
