export const renderGenericType = (type: string, gen?: string): string => gen ? `${type}<${gen}>` : type;
