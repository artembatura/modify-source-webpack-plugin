import path from 'path';
import { validate } from 'schema-utils';
import type { Schema } from 'schema-utils/declarations/validate';

import {
  SerializableClassInstance,
  operationFromSerializable
} from './serializable';

const schema: Schema = {
  type: 'object',
  properties: {
    operations: {
      type: 'array',
      items: {
        type: 'object'
      }
    },
    moduleRequest: {
      type: 'string'
    },
    constants: {
      type: 'object'
    }
  },
  additionalProperties: false
};

interface LoaderOptions {
  operations: SerializableClassInstance<any>[];
  moduleRequest: string;
  constants: Record<string, string>;
}

interface modifyModuleSourceLoader {
  getOptions?: () => LoaderOptions;
}

export default function modifyModuleSourceLoader(
  this: modifyModuleSourceLoader,
  source: string
): string {
  const options: LoaderOptions = this.getOptions
    ? this.getOptions()
    : require('loader-utils-webpack-v4').getOptions(this);

  validate(schema, options, {
    name: 'ModifySourcePlugin webpack loader'
  });

  const cleanPath = options.moduleRequest.split('?')[0];
  const fileName = path.basename(cleanPath);

  return options.operations.reduce((sourceText, serializableOp) => {
    const operation = operationFromSerializable(serializableOp, {
      ...options.constants,
      FILE_PATH: cleanPath,
      FILE_NAME: fileName
    });

    return operation.apply(sourceText);
  }, source);
}
