import path from 'path';
import type { Compiler } from 'webpack';
import { NormalModule } from 'webpack';

export interface Option {
  test: RegExp | ((module: NormalModule) => boolean);
  modify: (source: string, fileName: string) => string;
}

export type Options = Option | Option[];

const PLUGIN_NAME = 'ModifyModuleSourcePlugin';

export class ModifyModuleSourcePlugin {
  constructor(protected readonly options: Options) {}

  public apply(compiler: Compiler): void {
    const options: Option[] = [].concat(this.options as never[]);

    compiler.hooks.compilation.tap(PLUGIN_NAME, compilation => {
      NormalModule.getCompilationHooks(compilation).loader.tap(
        PLUGIN_NAME,
        (_, normalModule) => {
          const moduleRequest = normalModule.request || '';

          options.forEach(options => {
            const test = options.test;
            const isMatched = (() => {
              if (typeof test === 'function' && test(normalModule)) {
                return true;
              }

              return test instanceof RegExp && test.test(moduleRequest);
            })();

            if (isMatched) {
              normalModule.loaders.unshift({
                loader: require.resolve('./loader.js'),
                options: {
                  filename: path.basename(moduleRequest),
                  modify: options.modify
                },
                ident: 'ModifyModuleSourceLoader',
                type: undefined as any
              });
            }
          });
        }
      );
    });
  }
}
