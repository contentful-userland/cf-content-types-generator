import { ContentTypeField, ContentTypeFieldValidation, FieldItem } from 'contentful';
import {
  ContentModel,
  LoadedModel,
  NormalizedContentType,
  NormalizedEditorControl,
  NormalizedEditorInterface,
} from './model';

const asRecord = (value: unknown, label: string): Record<string, unknown> => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  throw new Error(`invalid ${label}`);
};

const asString = (value: unknown, label: string): string => {
  if (typeof value === 'string') {
    return value;
  }

  throw new Error(`invalid ${label}`);
};

const asBoolean = (value: unknown, label: string): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  throw new Error(`invalid ${label}`);
};

const asNumber = (value: unknown, label: string): number => {
  if (typeof value === 'number') {
    return value;
  }

  throw new Error(`invalid ${label}`);
};

const normalizeFieldItem = (value: unknown, label: string): FieldItem => {
  const record = asRecord(value, label);
  const normalized: Record<string, unknown> = {
    type: asString(record.type, `${label}.type`),
    validations: Array.isArray(record.validations)
      ? (record.validations as ContentTypeFieldValidation[])
      : [],
  };

  if (typeof record.linkType === 'string') {
    normalized.linkType = record.linkType;
  }

  return normalized as unknown as FieldItem;
};

const normalizeField = (value: unknown, index: number): ContentTypeField => {
  const record = asRecord(value, `field ${index}`);
  const normalized: Record<string, unknown> = {
    id: asString(record.id, `field ${index}.id`),
    name: asString(record.name, `field ${index}.name`),
    type: asString(record.type, `field ${index}.type`),
    required: asBoolean(record.required, `field ${index}.required`),
    localized: asBoolean(record.localized, `field ${index}.localized`),
    omitted: asBoolean(record.omitted, `field ${index}.omitted`),
    disabled: asBoolean(record.disabled, `field ${index}.disabled`),
    validations: Array.isArray(record.validations)
      ? (record.validations as ContentTypeFieldValidation[])
      : [],
  };

  if (record.items) {
    normalized.items = normalizeFieldItem(record.items, `field ${index}.items`);
  }

  if (typeof record.linkType === 'string') {
    normalized.linkType = record.linkType;
  }

  if (Array.isArray(record.allowedResources)) {
    normalized.allowedResources = record.allowedResources;
  }

  return normalized as unknown as ContentTypeField;
};

const normalizeContentType = (value: unknown, index: number): NormalizedContentType => {
  const record = asRecord(value, `content type ${index}`);
  const sys = asRecord(record.sys, `content type ${index}.sys`);
  const normalized: NormalizedContentType = {
    name: asString(record.name, `content type ${index}.name`),
    sys: {
      id: asString(sys.id, `content type ${index}.sys.id`),
      type: asString(sys.type, `content type ${index}.sys.type`),
    },
    fields: Array.isArray(record.fields)
      ? record.fields.map((field, fieldIndex) => normalizeField(field, fieldIndex))
      : [],
  };

  if (sys.createdBy) {
    const createdBy = asRecord(sys.createdBy, `content type ${index}.sys.createdBy`);
    const createdBySys = asRecord(createdBy.sys, `content type ${index}.sys.createdBy.sys`);
    normalized.sys.createdBy = {
      sys: {
        id: asString(createdBySys.id, `content type ${index}.sys.createdBy.sys.id`),
      },
    };
  }

  if (typeof sys.firstPublishedAt === 'string') {
    normalized.sys.firstPublishedAt = sys.firstPublishedAt;
  }

  if (typeof sys.publishedVersion === 'number') {
    normalized.sys.publishedVersion = asNumber(
      sys.publishedVersion,
      `content type ${index}.sys.publishedVersion`,
    );
  }

  return normalized;
};

const normalizeEditorControl = (value: unknown, index: number): NormalizedEditorControl => {
  const record = asRecord(value, `editor control ${index}`);
  const normalized: NormalizedEditorControl = {
    fieldId: asString(record.fieldId, `editor control ${index}.fieldId`),
  };

  if (record.settings) {
    const settings = asRecord(record.settings, `editor control ${index}.settings`);
    if (typeof settings.helpText === 'string') {
      normalized.settings = {
        helpText: settings.helpText,
      };
    }
  }

  return normalized;
};

const normalizeEditorInterface = (value: unknown, index: number): NormalizedEditorInterface => {
  const record = asRecord(value, `editor interface ${index}`);
  const sys = asRecord(record.sys, `editor interface ${index}.sys`);
  const contentType = asRecord(sys.contentType, `editor interface ${index}.sys.contentType`);
  const contentTypeSys = asRecord(contentType.sys, `editor interface ${index}.sys.contentType.sys`);

  return {
    sys: {
      contentType: {
        sys: {
          id: asString(contentTypeSys.id, `editor interface ${index}.sys.contentType.sys.id`),
        },
      },
    },
    controls: Array.isArray(record.controls)
      ? record.controls.map((control, controlIndex) =>
          normalizeEditorControl(control, controlIndex),
        )
      : [],
  };
};

const missingContentTypesError = (loadedModel: LoadedModel): Error => {
  if (loadedModel.source.kind === 'file') {
    return new Error(`file ${loadedModel.source.filePath} is missing "contentTypes" field`);
  }

  return new Error('input is missing "contentTypes" field');
};

export const normalizeModel = (loadedModel: LoadedModel): ContentModel => {
  const record = asRecord(loadedModel.data, 'content model');

  if (!Array.isArray(record.contentTypes)) {
    throw missingContentTypesError(loadedModel);
  }

  return {
    contentTypes: record.contentTypes.map((contentType, index) =>
      normalizeContentType(contentType, index),
    ),
    editorInterfaces: Array.isArray(record.editorInterfaces)
      ? record.editorInterfaces.map((editorInterface, index) =>
          normalizeEditorInterface(editorInterface, index),
        )
      : [],
  };
};
