import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import webpack, { Configuration } from 'webpack';

import { ModifyModuleSourcePlugin } from '../ModifyModuleSourcePlugin';
import DoneCallback = jest.DoneCallback;

const OUTPUT_DIR = path.resolve(__dirname, '../build/basic-test');
const OUTPUT_BUNDLE = 'bundle.js';

function testPlugin(
  webpackConfig: Configuration,
  done: DoneCallback,
  expectBundleContent?: (string | [RegExp, number])[],
  expectModulesContent?: Array<{
    module: string;
    shouldContain?: Array<string | [RegExp, number]>;
    shouldEqual?: string;
  }>,
  expectErrors?: boolean,
  expectWarnings?: boolean
) {
  webpack(webpackConfig, (err, stats) => {
    expect(err).toBeFalsy();

    const compilationErrors = (stats.compilation.errors || []).join('\n');

    if (expectErrors) {
      expect(compilationErrors).not.toBe('');
    } else {
      expect(compilationErrors).toBe('');
    }

    const compilationWarnings = (stats.compilation.warnings || []).join('\n');

    if (expectWarnings) {
      expect(compilationWarnings).not.toBe('');
    } else {
      expect(compilationWarnings).toBe('');
    }

    const bundleContent = fs
      .readFileSync(OUTPUT_DIR + '/' + OUTPUT_BUNDLE)
      .toString();

    expectBundleContent?.forEach(expectedContent => {
      if (Array.isArray(expectedContent)) {
        const [regExp, matchCount] = expectedContent;

        if (matchCount === 0) {
          return expect(bundleContent.match(regExp)).toBe(null);
        }

        return expect(bundleContent.match(regExp)).toHaveLength(matchCount);
      }

      expect(bundleContent).toContain(expectedContent);
    });

    expectModulesContent?.forEach(expectedContent => {
      const { module, shouldContain, shouldEqual } = expectedContent;

      const modulePath = getModulePath(module);
      const moduleMeta = stats.compilation._modules.get(modulePath);

      expect(moduleMeta).toBeTruthy();

      const moduleSource = moduleMeta._source._value;

      if (shouldEqual) {
        expect(moduleSource).toEqual(shouldEqual);
      }

      shouldContain?.forEach(containItem => {
        if (Array.isArray(containItem)) {
          const [regExp, matchCount] = containItem;

          if (matchCount === 0) {
            return expect(moduleSource.match(regExp)).toBe(null);
          }

          return expect(moduleSource.match(regExp)).toHaveLength(matchCount);
        }

        expect(moduleSource).toContain(containItem);
      });
    });

    stats.compilation.modules.forEach(module => {
      module._module;
    });

    done();
  });
}

function getModulePath(fileName: string): string {
  return path.join(__dirname, `fixtures/${fileName}`);
}

const modifyModule = (src: string, fileName: string) =>
  src + `\n[::SOME_UNIQUE_STRING][${fileName}]`;

describe('ModifyModuleSourcePlugin', () => {
  beforeEach(done => {
    rimraf(OUTPUT_DIR, done);
  });

  it('modifies first module', done => {
    testPlugin(
      {
        mode: 'development',
        entry: path.join(__dirname, 'fixtures/index.js'),
        output: {
          path: OUTPUT_DIR,
          filename: OUTPUT_BUNDLE
        },
        plugins: [
          new ModifyModuleSourcePlugin({
            test: /index\.js$/,
            modify: modifyModule,
            findFirst: true
          })
        ]
      },
      done,
      [
        [/\\n\[::SOME_UNIQUE_STRING]\[index\.js]/g, 1],
        [/\\n\[::SOME_UNIQUE_STRING]\[one-module\.js]/g, 0],
        [/\\n\[::SOME_UNIQUE_STRING]\[two-module\.js]/g, 0]
      ],
      [
        {
          module: 'index.js',
          shouldContain: [[/\n\[::SOME_UNIQUE_STRING]\[index\.js]/g, 1]],
          shouldEqual: modifyModule(
            fs.readFileSync(getModulePath('index.js')).toString(),
            'index.js'
          )
        },
        {
          module: 'one-module.js',
          shouldContain: [[/\n\[::SOME_UNIQUE_STRING]\[one-module\.js]/g, 0]],
          shouldEqual: fs
            .readFileSync(getModulePath('one-module.js'))
            .toString()
        },
        {
          module: 'two-module.js',
          shouldContain: [[/\n\[::SOME_UNIQUE_STRING]\[two-module\.js]/g, 0]],
          shouldEqual: fs
            .readFileSync(getModulePath('two-module.js'))
            .toString()
        }
      ]
    );
  });

  it('modifies only one-module.js by regexp', done => {
    testPlugin(
      {
        mode: 'development',
        entry: path.join(__dirname, 'fixtures/index.js'),
        output: {
          path: OUTPUT_DIR,
          filename: OUTPUT_BUNDLE
        },
        plugins: [
          new ModifyModuleSourcePlugin({
            test: /one-module\.js$/,
            modify: (src, fileName) =>
              src + `\n[::SOME_UNIQUE_STRING][${fileName}]`
          })
        ]
      },
      done,
      [
        [/\\n\[::SOME_UNIQUE_STRING]\[index\.js]/g, 0],
        [/\\n\[::SOME_UNIQUE_STRING]\[one-module\.js]/g, 1],
        [/\\n\[::SOME_UNIQUE_STRING]\[two-module\.js]/g, 0]
      ],
      [
        {
          module: 'index.js',
          shouldContain: [[/\n\[::SOME_UNIQUE_STRING]\[index\.js]/g, 0]],
          shouldEqual: fs.readFileSync(getModulePath('index.js')).toString()
        },
        {
          module: 'one-module.js',
          shouldContain: [[/\n\[::SOME_UNIQUE_STRING]\[one-module\.js]/g, 1]],
          shouldEqual: modifyModule(
            fs.readFileSync(getModulePath('one-module.js')).toString(),
            'one-module.js'
          )
        },
        {
          module: 'two-module.js',
          shouldContain: [[/\n\[::SOME_UNIQUE_STRING]\[two-module\.js]/g, 0]],
          shouldEqual: fs
            .readFileSync(getModulePath('two-module.js'))
            .toString()
        }
      ]
    );
  });

  it('modifies only two-module.js by regexp', done => {
    testPlugin(
      {
        mode: 'development',
        entry: path.join(__dirname, 'fixtures/index.js'),
        output: {
          path: OUTPUT_DIR,
          filename: OUTPUT_BUNDLE
        },
        plugins: [
          new ModifyModuleSourcePlugin({
            test: /two-module\.js$/,
            modify: (src, fileName) =>
              src + `\n[::SOME_UNIQUE_STRING][${fileName}]`
          })
        ]
      },
      done,
      [
        [/\\n\[::SOME_UNIQUE_STRING]\[index\.js]/g, 0],
        [/\\n\[::SOME_UNIQUE_STRING]\[one-module\.js]/g, 0],
        [/\\n\[::SOME_UNIQUE_STRING]\[two-module\.js]/g, 1]
      ],
      [
        {
          module: 'index.js',
          shouldContain: [[/\n\[::SOME_UNIQUE_STRING]\[index\.js]/g, 0]],
          shouldEqual: fs.readFileSync(getModulePath('index.js')).toString()
        },
        {
          module: 'one-module.js',
          shouldContain: [[/\n\[::SOME_UNIQUE_STRING]\[one-module\.js]/g, 0]],
          shouldEqual: fs
            .readFileSync(getModulePath('one-module.js'))
            .toString()
        },
        {
          module: 'two-module.js',
          shouldContain: [[/\n\[::SOME_UNIQUE_STRING]\[two-module\.js]/g, 1]],
          shouldEqual: modifyModule(
            fs.readFileSync(getModulePath('two-module.js')).toString(),
            'two-module.js'
          )
        }
      ]
    );
  });

  it('modifies all modules', done => {
    testPlugin(
      {
        mode: 'development',
        entry: path.join(__dirname, 'fixtures/index.js'),
        output: {
          path: OUTPUT_DIR,
          filename: OUTPUT_BUNDLE
        },
        plugins: [
          new ModifyModuleSourcePlugin({
            test: /.+\.js$/,
            modify: (src, fileName) =>
              src + `\n[::SOME_UNIQUE_STRING][${fileName}]`
          })
        ]
      },
      done,
      [
        [/\\n\[::SOME_UNIQUE_STRING]\[index\.js]/g, 1],
        [/\\n\[::SOME_UNIQUE_STRING]\[one-module\.js]/g, 1],
        [/\\n\[::SOME_UNIQUE_STRING]\[two-module\.js]/g, 1]
      ],
      [
        {
          module: 'index.js',
          shouldContain: [[/\n\[::SOME_UNIQUE_STRING]\[index\.js]/g, 1]],
          shouldEqual: modifyModule(
            fs.readFileSync(getModulePath('index.js')).toString(),
            'index.js'
          )
        },
        {
          module: 'one-module.js',
          shouldContain: [[/\n\[::SOME_UNIQUE_STRING]\[one-module\.js]/g, 1]],
          shouldEqual: modifyModule(
            fs.readFileSync(getModulePath('one-module.js')).toString(),
            'one-module.js'
          )
        },
        {
          module: 'two-module.js',
          shouldContain: [[/\n\[::SOME_UNIQUE_STRING]\[two-module\.js]/g, 1]],
          shouldEqual: modifyModule(
            fs.readFileSync(getModulePath('two-module.js')).toString(),
            'two-module.js'
          )
        }
      ]
    );
  });

  it('modifies only one module by findFirst', done => {
    testPlugin(
      {
        mode: 'development',
        entry: path.join(__dirname, 'fixtures/index.js'),
        output: {
          path: OUTPUT_DIR,
          filename: OUTPUT_BUNDLE
        },
        plugins: [
          new ModifyModuleSourcePlugin({
            test: /.+\.js$/,
            modify: (src, fileName) =>
              src + `\n[::SOME_UNIQUE_STRING][${fileName}]`,
            findFirst: true
          })
        ]
      },
      done,
      [
        [/\\n\[::SOME_UNIQUE_STRING]\[index\.js]/g, 1],
        [/\\n\[::SOME_UNIQUE_STRING]\[one-module\.js]/g, 0],
        [/\\n\[::SOME_UNIQUE_STRING]\[two-module\.js]/g, 0]
      ],
      [
        {
          module: 'index.js',
          shouldContain: [[/\n\[::SOME_UNIQUE_STRING]\[index\.js]/g, 1]],
          shouldEqual: modifyModule(
            fs.readFileSync(getModulePath('index.js')).toString(),
            'index.js'
          )
        },
        {
          module: 'one-module.js',
          shouldContain: [[/\n\[::SOME_UNIQUE_STRING]\[one-module\.js]/g, 0]],
          shouldEqual: fs
            .readFileSync(getModulePath('one-module.js'))
            .toString()
        },
        {
          module: 'two-module.js',
          shouldContain: [[/\n\[::SOME_UNIQUE_STRING]\[two-module\.js]/g, 0]],
          shouldEqual: fs
            .readFileSync(getModulePath('two-module.js'))
            .toString()
        }
      ]
    );
  });
});
