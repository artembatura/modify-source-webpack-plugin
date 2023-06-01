## 4.1.0 (2023-06-01)

### Issue [#87](https://github.com/artembatura/modify-source-webpack-plugin/issues/87)

Fixed bug when plugin doesn't attach loader to module and file is not being modified again in watch mode after triggered re-compilation.

## 4.0.0 (2023-02-11)

The main step forward in this release was rejecting a bad approach with global variable which was used to access modify functions from webpack loader.

It was used since passing functions directly to webpack loader options is not possible because webpack sometimes rehydrate options object before they came in the loader (as I understood).

### Illustration of the problem with previous solution

Passing options to loader.

`ModifySourcePlugin.js`

```js
normalModule.loaders.push({
  loader: require.resolve('./loader.js'),
  options: {
    path: moduleRequest,
    modifyFunctions: [src => src + '// my added code'] // <= Passing function here.
  }
});
```

Receiving options in loader.

`loader.js`

```js
module.exports = function loader(source) {
  const options = getOptions(this); // = { modifyFunctions: ["Function"] } <= Problem here: function received as string after rehydration.

  // ...
};
```

In previous versions we tried to bypass this restriction and used this "bad crutch":

`ModifySourcePlugin.js`

```js
global.modifyFunctions = rules.map(rule => rule.modify);
```

And accessing from loader:

`loader.js`

```js
module.exports = function loader(source) {
  const options = getOptions(this); // { "path": "path/to/file.js", ruleIndex: 0 }

  const modify = global.modifyFunctions[options.ruleIndex];
};
```

This approach cause [critical bugs](https://github.com/artembatura/modify-source-webpack-plugin/issues/59) what led to the rejection from this approach (thanks to [@dreamerblue](https://github.com/dreamerblue) for reporting this).

Operations it's a new static way to describe how modules should be modified with the capability of proper caching by webpack.

## Migration guide (3.x to 4.x)

- `options.rules[].modify` property was removed.

- `options.rules[].operations[]` property has added.

<details>
  <summary>Before: (clickable)</summary>

```ts
import { ModifySourcePlugin } from 'modify-source-webpack-plugin';

module.exports = {
  plugins: [
    new ModifySourcePlugin({
      rules: [
        {
          test: /my-file\.js$/,
          modify: (src, path) => {
            let newSrc = src;

            // writing at start of file
            newSrc = 'value' + newSrc;
            // writing at end of file
            newSrc += 'value';
            // replacing text once
            newSrc = newSrc.replace('searchValue', 'replaceValue');
            // replacing all text in file
            newSrc = newSrc.replaceAll('searchValue', 'replaceValue');

            // ...

            return newSrc;
          }
        }
      ]
    })
  ]
};
```

</details>

Now:

```ts
import {
  ModifySourcePlugin,
  ConcatOperation,
  ReplaceOperation
} from 'modify-source-webpack-plugin';

module.exports = {
  plugins: [
    new ModifySourcePlugin({
      rules: [
        {
          test: /my-file\.js$/,
          operations: [
            // writing at start of file
            new ConcatOperation('start', 'value'),
            // writing at end of file
            new ConcatOperation('end', 'value'),
            // replacing text once
            new ReplaceOperation('once', 'searchValue', 'replaceValue'),
            // replacing all text in file
            new ReplaceOperation('all', 'searchValue', 'replaceValue')
          ]
        }
      ]
    })
  ]
};
```

See a more specific examples with comparison below.

### Write data in start/end of file

```diff
new ModifySourcePlugin({
  rules: [
    {
      test: /my-file\.js$/,
-     modify: (src) => 'start of file' + src
+     operations: [
+       new ConcatOperation('start', 'start of file')
+     ]
    }
  ]
})
```

```diff
new ModifySourcePlugin({
  rules: [
    {
      test: /my-file\.js$/,
-     modify: (src) => src + 'end of file'
+     operations: [
+       new ConcatOperation('end', 'end of file')
+     ]
    }
  ]
})
```

### Replace text

Replace first found text:

```diff
new ModifySourcePlugin({
  rules: [
    {
      test: /my-file\.js$/,
-     modify: (src) => src.replace('searchValue', 'replaceValue')
+     operations: [
+       new ReplaceOperation('once', 'searchValue', 'replaceValue')
+     ]
    }
  ]
})
```

Replace all found text:

```diff
new ModifySourcePlugin({
  rules: [
    {
      test: /my-file\.js$/,
-     modify: (src) => src.replaceAll('searchValue', 'replaceValue')
+     operations: [
+       new ReplaceOperation('all', 'searchValue', 'replaceValue')
+     ]
    }
  ]
})
```

### Using Compile-time constants

`$FILE_PATH` is a constant as a replacement for "path" argument of `modify` function.

```diff
new ModifySourcePlugin({
  rules: [
    {
      test: /my-file\.js$/,
-     modify: (src, path) => src + 'path: ' + path
+     operations: [
+       new ConcatOperation('end', 'path: $FILE_PATH')
+     ]
    }
  ]
})
```

And the new `$FILE_NAME` constant.

```diff
const path = require('path');

new ModifySourcePlugin({
  rules: [
    {
      test: /my-file\.js$/,
-     modify: (src, path) => src + 'filename: ' + path.basename(path)
+     operations: [
+       new ConcatOperation('end', 'filename: $FILE_NAME')
+     ]
    }
  ]
})
```

## 3.0.0 (2021-05-22)

#### :boom: Breaking Change

- [#55](https://github.com/artembatura/modify-source-webpack-plugin/pull/55) Pass full path instead of filename to modify function. [Issue](https://github.com/artembatura/modify-source-webpack-plugin/issues/53)

#### :nail_care: Enhancement

- [#55](https://github.com/artembatura/modify-source-webpack-plugin/pull/55) Support for Webpack 5 and Webpack 4 in one package

- [#55](https://github.com/artembatura/modify-source-webpack-plugin/pull/55) Validate incoming options to plugin
