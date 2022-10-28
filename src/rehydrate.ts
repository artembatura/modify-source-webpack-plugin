export function rehydrate(options: Record<string, any>): Record<string, any> {
  return JSON.parse(JSON.stringify(options));
}
