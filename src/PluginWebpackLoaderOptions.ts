import { AbstractOperation } from './operations';
import { SerializableClassInstance } from './serializable';

export type PluginWebpackLoaderOptions = {
  moduleRequest: string;
  operations?: SerializableClassInstance<AbstractOperation>[];
  constants: Record<string, string | number>;
};
