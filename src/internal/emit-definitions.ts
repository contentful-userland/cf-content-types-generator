import CFDefinitionsBuilder from '../cf-definitions-builder';
import { Renderer } from '../renderer';
import { ContentModel } from './model';

export const emitDefinitions = (
  model: ContentModel,
  renderers: Renderer[] = [],
): CFDefinitionsBuilder => {
  const builder = new CFDefinitionsBuilder(renderers);
  const editorInterfacesByContentTypeId = new Map(
    model.editorInterfaces.map((editorInterface) => {
      return [editorInterface.sys.contentType.sys.id, editorInterface] as const;
    }),
  );

  for (const contentType of model.contentTypes) {
    builder.appendType(contentType, editorInterfacesByContentTypeId.get(contentType.sys.id));
  }

  return builder;
};
