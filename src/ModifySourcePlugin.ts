import type { Compiler, NormalModule } from 'webpack';

import { AbstractOperation } from './operations';
import { rehydrate } from './rehydrate';

const { validate } = require('schema-utils');

export interface Rule {
  test: RegExp | ((module: NormalModule) => boolean);
  operations?: AbstractOperation[];
}

export type Options = {
  debug?: boolean;
  rules: Rule[];
};

const validationSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    debug: {
      type: 'boolean'
    },
    rules: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          test: {
            anyOf: [{ instanceof: 'Function' }, { instanceof: 'RegExp' }]
          },
          operations: {
            type: 'array',
            items: {
              type: 'object'
            }
          }
        }
      }
    }
  }
};

const PLUGIN_NAME = 'ModifySourcePlugin';

export class ModifySourcePlugin {
  constructor(protected readonly options: Options) {
    validate(validationSchema, options, {
      name: PLUGIN_NAME
    });
  }

  public apply(compiler: Compiler): void {
    const { rules, debug } = this.options;

    const modifiedModules: (string | number)[] = [];

    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      const tapCallback = (_: any, normalModule: NormalModule) => {
        const userRequest = normalModule.userRequest || '';

        const startIndex =
          userRequest.lastIndexOf('!') === -1
            ? 0
            : userRequest.lastIndexOf('!') + 1;

        const moduleRequest = userRequest
          .substring(startIndex)
          .replace(/\\/g, '/');

        if (modifiedModules.includes(moduleRequest)) {
          return;
        }

        rules.forEach(options => {
          const test = options.test;
          const isMatched = (() => {
            if (typeof test === 'function' && test(normalModule)) {
              return true;
            }

            return test instanceof RegExp && test.test(moduleRequest);
          })();

          if (isMatched) {
            type NormalModuleLoader = {
              loader: string;
              options: any;
              ident?: string;
              type?: string;
            };

            (normalModule.loaders as NormalModuleLoader[]).push({
              loader: require.resolve('./loader.js'),
              options: rehydrate({
                moduleRequest,
                operations: options.operations
              })
            });

            modifiedModules.push(moduleRequest);

            if (debug) {
              // eslint-disable-next-line no-console
              console.log(
                `\n[${PLUGIN_NAME}] Use loader for "${moduleRequest}".`
              );
            }
          }
        });
      };

      const NormalModule = compiler.webpack?.NormalModule;
      const isNormalModuleAvailable = Boolean(NormalModule);

      if (
        isNormalModuleAvailable &&
        Boolean(NormalModule.getCompilationHooks)
      ) {
        NormalModule.getCompilationHooks(compilation).beforeLoaders.tap(
          PLUGIN_NAME,
          tapCallback
        );
      } else {
        compilation.hooks.normalModuleLoader.tap(PLUGIN_NAME, tapCallback);
      }
    });
  }
}
