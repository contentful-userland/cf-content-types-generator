import { upperFirst } from 'lodash';
import { pipe } from 'lodash/fp';

const removeSpace = (input: string): string => input.replace(/\s/g, '');
const replaceDash = (input: string): string => input.replace(/-/g, '__');
const replaceInvalidIdentifierChars = (input: string): string => input.replace(/[^\w$]/g, '__');
const addPrefix = (input: string): string => (input.startsWith('Type') ? input : `Type${input}`);

export const moduleName = (name: string): string => {
  return pipe([removeSpace, replaceDash, replaceInvalidIdentifierChars, upperFirst, addPrefix])(
    name,
  );
};

export const moduleSkeletonName = (name: string): string => {
  return moduleName(name) + 'Skeleton';
};

export const moduleFieldsName = (name: string): string => {
  return moduleName(name) + 'Fields';
};
