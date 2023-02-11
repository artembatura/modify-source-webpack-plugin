import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import webpackV5, { Stats } from 'webpack';
import webpackV4 from 'webpack-v4';

import { ModifySourcePlugin } from '../ModifySourcePlugin';
import { ConcatOperation } from '../operations';

const PnpWebpackPlugin = require('pnp-webpack-plugin');

import DoneCallback = jest.DoneCallback;

const OUTPUT_PATH = path.resolve(__dirname, './build/basic-test');
const OUTPUT_BUNDLE = 'bundle.js';

function testPlugin(
  webpack: any,
  config: any,
  done: DoneCallback,
  expectModulesContent: Array<{
    module: string;
    shouldContain?: Array<string | [RegExp, number]>;
    shouldEqual?: string;
  }>,
  expectBundleContent?: Array<string | [RegExp, number]>,
  expectErrors?: boolean,
  expectWarnings?: boolean
): void {
  webpack(config, (err: Record<string, any> | false, stats: Stats) => {
    expect(err).toBeFalsy();

    const compilationErrors = (stats?.compilation.errors || []).join('\n');

    if (expectErrors) {
      expect(compilationErrors).not.toBe('');
    } else {
      expect(compilationErrors).toBe('');
    }

    const compilationWarnings = (stats?.compilation.warnings || []).join('\n');

    if (expectWarnings) {
      expect(compilationWarnings).not.toBe('');
    } else {
      expect(compilationWarnings).toBe('');
    }

    expectModulesContent.forEach(expectedContent => {
      const { module, shouldContain, shouldEqual } = expectedContent;

      const modulePath = getModulePath(module);
      const modules = Array.from(stats?.compilation.modules?.values() || []);
      const moduleMeta = modules.find(
        module => (module as any).resource === modulePath
      );

      expect(moduleMeta).toBeTruthy();

      const originalSource = moduleMeta?.originalSource();

      const moduleSource = originalSource
        ? originalSource.source().toString()
        : undefined;

      if (shouldEqual) {
        expect(moduleSource).toEqual(shouldEqual);
      }

      shouldContain?.forEach(containItem => {
        if (Array.isArray(containItem)) {
          const [regExp, matchCount] = containItem;

          if (matchCount === 0) {
            return expect(moduleSource?.match(regExp)).toBe(null);
          }

          return expect(moduleSource?.match(regExp)).toHaveLength(matchCount);
        }

        expect(moduleSource).toContain(containItem);
      });
    });

    const bundleExists = fs.existsSync(OUTPUT_PATH + '/' + OUTPUT_BUNDLE);

    expect(bundleExists).toBe(true);

    if (!bundleExists) {
      return done();
    }

    const bundleContent = fs
      .readFileSync(OUTPUT_PATH + '/' + OUTPUT_BUNDLE)
      .toString();

    const _expectBundleContent =
      expectBundleContent ||
      expectModulesContent.map(expectMeta => expectMeta.shouldContain).flat();

    // also check bundle content
    _expectBundleContent.forEach(expectedContent => {
      if (!expectedContent) {
        return;
      }

      if (Array.isArray(expectedContent)) {
        const [regExp, matchCount] = expectedContent;

        if (matchCount === 0) {
          return expect(bundleContent.match(regExp)).toBe(null);
        }

        return expect(bundleContent.match(regExp)).toHaveLength(matchCount);
      }

      expect(bundleContent).toContain(expectedContent);
    });

    done();
  });
}

function getModulePath(fileName: string): string {
  return path.join(__dirname, `fixtures/${fileName}`);
}

const moduleSrcOperation = new ConcatOperation(
  'end',
  '// [::SOME_UNIQUE_STRING][$FILE_NAME]'
);
const cssSrcOperation = new ConcatOperation(
  'end',
  '/* [::SOME_UNIQUE_STRING][$FILE_NAME] */'
);
const modernNormalizeCssOperation = new ConcatOperation(
  'end',
  '.myExtraClass { background: gray; /* $FILE_NAME */ }'
);

const modifyModuleSrc = (src: string, filePath: string) =>
  src + `// [::SOME_UNIQUE_STRING][${path.basename(filePath)}]`;

// const modifyCssSrc = (src: string, filePath: string) =>
//   src + `/* [::SOME_UNIQUE_STRING][${path.basename(filePath)}] */`;

function runTests(webpack: typeof webpackV4 | typeof webpackV5) {
  beforeEach(done => {
    rimraf(OUTPUT_PATH, done);
  });

  it('modifies first module', done => {
    testPlugin(
      webpack,
      {
        mode: 'development',
        entry: path.join(__dirname, 'fixtures/index.js'),
        output: {
          path: OUTPUT_PATH,
          filename: OUTPUT_BUNDLE
        },
        plugins: [
          new ModifySourcePlugin({
            rules: [
              {
                test: /index\.js$/,
                operations: [moduleSrcOperation]
              }
            ]
          })
        ]
      },
      done,
      [
        {
          module: 'index.js',
          shouldContain: [[/\/\/ \[::SOME_UNIQUE_STRING]\[index\.js]/g, 1]],
          shouldEqual: modifyModuleSrc(
            fs.readFileSync(getModulePath('index.js')).toString(),
            'index.js'
          )
        },
        {
          module: 'one-module.js',
          shouldContain: [
            [/\/\/ \[::SOME_UNIQUE_STRING]\[one-module\.js]/g, 0]
          ],
          shouldEqual: fs
            .readFileSync(getModulePath('one-module.js'))
            .toString()
        },
        {
          module: 'two-module.js',
          shouldContain: [
            [/\/\/ \[::SOME_UNIQUE_STRING]\[two-module\.js]/g, 0]
          ],
          shouldEqual: fs
            .readFileSync(getModulePath('two-module.js'))
            .toString()
        }
      ]
    );
  });

  it('modifies only one-module.js by regexp', done => {
    testPlugin(
      webpack,
      {
        mode: 'development',
        entry: path.join(__dirname, 'fixtures/index.js'),
        output: {
          path: OUTPUT_PATH,
          filename: OUTPUT_BUNDLE
        },
        plugins: [
          new ModifySourcePlugin({
            rules: [
              {
                test: /one-module\.js$/,
                operations: [moduleSrcOperation]
              }
            ]
          })
        ]
      },
      done,
      [
        {
          module: 'index.js',
          shouldContain: [[/\/\/ \[::SOME_UNIQUE_STRING]\[index\.js]/g, 0]],
          shouldEqual: fs.readFileSync(getModulePath('index.js')).toString()
        },
        {
          module: 'one-module.js',
          shouldContain: [
            [/\/\/ \[::SOME_UNIQUE_STRING]\[one-module\.js]/g, 1]
          ],
          shouldEqual: modifyModuleSrc(
            fs.readFileSync(getModulePath('one-module.js')).toString(),
            'one-module.js'
          )
        },
        {
          module: 'two-module.js',
          shouldContain: [
            [/\/\/ \[::SOME_UNIQUE_STRING]\[two-module\.js]/g, 0]
          ],
          shouldEqual: fs
            .readFileSync(getModulePath('two-module.js'))
            .toString()
        }
      ]
    );
  });

  it('modifies only two-module.js by regexp', done => {
    testPlugin(
      webpack,
      {
        mode: 'development',
        entry: path.join(__dirname, 'fixtures/index.js'),
        output: {
          path: OUTPUT_PATH,
          filename: OUTPUT_BUNDLE
        },
        plugins: [
          new ModifySourcePlugin({
            rules: [
              {
                test: /two-module\.js$/,
                operations: [moduleSrcOperation]
              }
            ]
          })
        ]
      },
      done,
      [
        {
          module: 'index.js',
          shouldContain: [[/\/\/ \[::SOME_UNIQUE_STRING]\[index\.js]/g, 0]],
          shouldEqual: fs.readFileSync(getModulePath('index.js')).toString()
        },
        {
          module: 'one-module.js',
          shouldContain: [
            [/\/\/ \[::SOME_UNIQUE_STRING]\[one-module\.js]/g, 0]
          ],
          shouldEqual: fs
            .readFileSync(getModulePath('one-module.js'))
            .toString()
        },
        {
          module: 'two-module.js',
          shouldContain: [
            [/\/\/ \[::SOME_UNIQUE_STRING]\[two-module\.js]/g, 1]
          ],
          shouldEqual: modifyModuleSrc(
            fs.readFileSync(getModulePath('two-module.js')).toString(),
            'two-module.js'
          )
        }
      ]
    );
  });

  it('modifies all modules', done => {
    testPlugin(
      webpack,
      {
        mode: 'development',
        entry: path.join(__dirname, 'fixtures/index.js'),
        output: {
          path: OUTPUT_PATH,
          filename: OUTPUT_BUNDLE
        },
        plugins: [
          new ModifySourcePlugin({
            rules: [
              {
                test: /.+\.js$/,
                operations: [moduleSrcOperation]
              }
            ]
          })
        ]
      },
      done,
      [
        {
          module: 'index.js',
          shouldContain: [[/\/\/ \[::SOME_UNIQUE_STRING]\[index\.js]/g, 1]],
          shouldEqual: modifyModuleSrc(
            fs.readFileSync(getModulePath('index.js')).toString(),
            'index.js'
          )
        },
        {
          module: 'one-module.js',
          shouldContain: [
            [/\/\/ \[::SOME_UNIQUE_STRING]\[one-module\.js]/g, 1]
          ],
          shouldEqual: modifyModuleSrc(
            fs.readFileSync(getModulePath('one-module.js')).toString(),
            'one-module.js'
          )
        },
        {
          module: 'two-module.js',
          shouldContain: [
            [/\/\/ \[::SOME_UNIQUE_STRING]\[two-module\.js]/g, 1]
          ],
          shouldEqual: modifyModuleSrc(
            fs.readFileSync(getModulePath('two-module.js')).toString(),
            'two-module.js'
          )
        }
      ]
    );
  });

  it('modifies css file', done => {
    testPlugin(
      webpack,
      {
        mode: 'development',
        entry: path.join(__dirname, 'fixtures/index-css.js'),
        output: {
          path: OUTPUT_PATH,
          filename: OUTPUT_BUNDLE
        },
        plugins: [
          new ModifySourcePlugin({
            rules: [
              {
                test: /\.css$/,
                operations: [cssSrcOperation]
              }
            ]
          })
        ],
        module: {
          rules: [
            {
              test: /\.css$/i,
              use: ['style-loader', 'css-loader'].map(packageName =>
                require.resolve(packageName)
              )
            }
          ]
        },
        ...(webpack === webpackV4
          ? {
              resolve: {
                plugins: [PnpWebpackPlugin]
              },
              resolveLoader: {
                plugins: [PnpWebpackPlugin.moduleLoader(module)]
              }
            }
          : {})
      },
      done,
      [],
      [
        [/\/\* \[::SOME_UNIQUE_STRING]\[index-css\.js] \*\//g, 0],
        [/\/\* \[::SOME_UNIQUE_STRING]\[css-file\.css] \*\//g, 1]
      ]
    );
  });

  it('modifies external css file', done => {
    testPlugin(
      webpack,
      {
        mode: 'development',
        entry: path.join(__dirname, 'fixtures/index-ext-css.js'),
        output: {
          path: OUTPUT_PATH,
          filename: OUTPUT_BUNDLE
        },
        plugins: [
          new ModifySourcePlugin({
            rules: [
              {
                test: /node_modules\/modern-normalize\/modern-normalize\.css$/,
                operations: [modernNormalizeCssOperation]
              }
            ]
          })
        ],
        module: {
          rules: [
            {
              test: /\.css$/i,
              use: ['style-loader', 'css-loader'].map(packageName =>
                require.resolve(packageName)
              )
            }
          ]
        },
        ...(webpack === webpackV4
          ? {
              resolve: {
                plugins: [PnpWebpackPlugin]
              },
              resolveLoader: {
                plugins: [PnpWebpackPlugin.moduleLoader(module)]
              }
            }
          : {})
      },
      done,
      [],
      [
        [/\.myExtraClass { background: gray; \/\* ext-css\.css \*\/ }/g, 0],
        [
          /\.myExtraClass { background: gray; \/\* modern-normalize\.css \*\/ }/g,
          1
        ]
      ]
    );
  });
}

describe('ModifyModuleSourcePlugin::webpack-v5', () => {
  runTests(webpackV5);
});

describe('ModifyModuleSourcePlugin::webpack-v4', () => {
  runTests(webpackV4);
});
