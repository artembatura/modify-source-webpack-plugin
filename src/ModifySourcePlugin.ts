import crypto from 'crypto';
import { validate } from 'schema-utils';
import type { Schema } from 'schema-utils/declarations/validate';
import type { Compiler, NormalModule } from 'webpack';

import { getPluginLoaderPath } from './getPluginLoaderPath';
import { isPluginWebpackLoader } from './isPluginWebpackLoader';
import { NormalModuleLoader } from './NormalModuleLoader';
import { AbstractOperation } from './operations';
import { PluginWebpackLoaderOptions } from './PluginWebpackLoaderOptions';

export interface Rule {
  test: RegExp | ((module: NormalModule) => boolean);
  operations?: AbstractOperation[];
}

export type Options = {
  debug?: boolean;
  rules: Rule[];
  constants?: Record<string, string | number>;
};

const validationSchema: Schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
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
    },
    constants: {
      type: 'object'
    },
    debug: {
      type: 'boolean'
    }
  }
};

const PLUGIN_NAME = 'ModifySourcePlugin';

function hashModuleOptions(options: Record<string, any>): string {
  return crypto.createHash('md5').update(JSON.stringify(options)).digest('hex');
}

export class ModifySourcePlugin {
  constructor(protected readonly options: Options) {
    validate(validationSchema, options, {
      name: PLUGIN_NAME
    });
  }

  public apply(compiler: Compiler): void {
    const { rules, debug, constants = {} } = this.options;

    const appliedOperationHashes: string[] = [];

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

        const moduleLoaders = normalModule.loaders as NormalModuleLoader[];

        rules.forEach(ruleOptions => {
          const isRuleAlreadyApplied = moduleLoaders.some(moduleLoader => {
            if (isPluginWebpackLoader(moduleLoader)) {
              const loaderOptions =
                typeof moduleLoader.options === 'string'
                  ? (JSON.parse(
                      moduleLoader.options
                    ) as PluginWebpackLoaderOptions)
                  : moduleLoader.options;

              return appliedOperationHashes.includes(
                hashModuleOptions(loaderOptions)
              );
            }
          });

          if (isRuleAlreadyApplied) {
            return;
          }

          const test = ruleOptions.test;
          const isMatched = (() => {
            if (typeof test === 'function' && test(normalModule)) {
              return true;
            }

            return test instanceof RegExp && test.test(moduleRequest);
          })();

          if (isMatched) {
            const serializableOperations = ruleOptions.operations?.map(op =>
              op.toSerializable()
            );

            const loader: NormalModuleLoader = {
              loader: getPluginLoaderPath(),
              options: {
                moduleRequest,
                operations: serializableOperations,
                constants
              }
            };

            moduleLoaders.push(loader);
            appliedOperationHashes.push(hashModuleOptions(loader.options));

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
      const isNormalModuleAvailable =
        Boolean(NormalModule) && Boolean(NormalModule.getCompilationHooks);

      if (isNormalModuleAvailable) {
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
