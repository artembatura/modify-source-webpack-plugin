import type { Compiler } from 'webpack';
import { NormalModule } from 'webpack';

export interface Rule {
  test: RegExp | ((module: NormalModule) => boolean);
  modify: (source: string, path: string) => string;
}

export type Options = {
  debug?: boolean;
  rules: Rule[];
};

const PLUGIN_NAME = 'ModifySourcePlugin';

export class ModifySourcePlugin {
  constructor(protected readonly options: Options) {}

  public apply(compiler: Compiler): void {
    const { rules, debug } = this.options;

    const isWebpackV5 = compiler.webpack && compiler.webpack.version >= '5';

    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      const modifiedModules: (string | number)[] = [];

      (global as any).modifyFunctions = rules.map(rule => rule.modify);

      const tapCallback = (_: any, normalModule: NormalModule) => {
        const userRequest = normalModule.userRequest || '';

        const startIndex =
          userRequest.lastIndexOf('!') === -1
            ? 0
            : userRequest.lastIndexOf('!') + 1;

        const moduleRequest = userRequest
          .substr(startIndex)
          .replace(/\\/g, '/');

        if (modifiedModules.includes(moduleRequest)) {
          return;
        }

        rules.forEach((options, ruleIndex) => {
          const test = options.test;
          const isMatched = (() => {
            if (typeof test === 'function' && test(normalModule)) {
              return true;
            }

            return test instanceof RegExp && test.test(moduleRequest);
          })();

          if (debug && isMatched) {
            // eslint-disable-next-line no-console
            console.log(
              `[ModifySourcePlugin][${ruleIndex}] File ${moduleRequest} is matched - add loader for this module.`
            );
          }

          if (isMatched) {
            (normalModule.loaders as {
              loader: string;
              options: any;
              ident?: string;
              type?: string;
            }[]).push({
              loader: require.resolve('./loader.js'),
              options: {
                path: moduleRequest,
                ruleIndex
              }
            });

            modifiedModules.push(moduleRequest);
          }
        });
      };

      if (isWebpackV5) {
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
