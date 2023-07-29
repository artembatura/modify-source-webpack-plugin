import { getPluginLoaderPath } from './getPluginLoaderPath';
import { NormalModuleLoader } from './NormalModuleLoader';
import { PluginWebpackLoaderOptions } from './PluginWebpackLoaderOptions';

export function isPluginWebpackLoader(
  moduleLoader: NormalModuleLoader
): moduleLoader is NormalModuleLoader<PluginWebpackLoaderOptions> {
  return moduleLoader.loader === getPluginLoaderPath();
}
