export const renderTypeUnion = (types: string[]): string => {
  return types.sort().join(' | ');
};
