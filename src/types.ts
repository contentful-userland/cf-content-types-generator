import type {
  NormalizedContentType,
  NormalizedEditorControl,
  NormalizedEditorInterface,
} from './internal/model';

export type WriteCallback = (filePath: string, content: string) => Promise<void>;

export type CFContentType = NormalizedContentType;

export type CFEditorInterface = NormalizedEditorInterface;

export type CFEditorInterfaceControl = NormalizedEditorControl;
