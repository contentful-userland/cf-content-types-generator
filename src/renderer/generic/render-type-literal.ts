export const renderTypeLiteral = (value: string): string => {
  if (value === 'undefined') {
    return 'undefined';
  }
  if (value === 'null') {
    return 'null';
  }
  return JSON.stringify(value);
};
