export function getPluginLoaderPath(): string {
  try {
    return require.resolve('./loader');
  } catch (e) {
    return require.resolve('../build/loader.js');
  }
}
