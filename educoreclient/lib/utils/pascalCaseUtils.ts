// Utility: Convert object keys to PascalCase for .NET backend compatibility
export function toPascalCase(str: string) {
  return str.replace(/(^|_)([a-z])/g, (_, __, c) => c.toUpperCase());
}

export function keysToPascalCase(obj: Record<string, any>): Record<string, any> {
  if (Array.isArray(obj)) {
    return obj.map(keysToPascalCase);
  } else if (obj && typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      acc[toPascalCase(key)] = keysToPascalCase(value);
      return acc;
    }, {} as Record<string, any>);
  }
  return obj;
}
