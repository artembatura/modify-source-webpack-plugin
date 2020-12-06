# modify-source-webpack-plugin

Webpack Plugin, which modifying modules source.

## Compatibility

| Version | Status |
| ------- | ------ |
| ^5.0.0  | ✅     |
| ^4.4.0  | ✅     |

## Installation

### NPM

```
npm i -D modify-source-webpack-plugin
```

### Yarn

```
yarn add -D modify-source-webpack-plugin
```

## Import

### ES6/TypeScript

```js
import { ModifyModuleSourcePlugin } from 'modify-source-webpack-plugin';
```

### CJS

```js
const { ModifyModuleSourcePlugin } = require('modify-source-webpack-plugin');
```

## Usage

**webpack.config.js**

```js
module.exports = {
  plugins: [new ModifyModuleSourcePlugin(options)]
};
```

## Options

### `test`

Type: `RegExp | ((module: webpack.NormalModule) => boolean)`

`Required`

`test` is RegExp or function, which used to determinate which modules should be modified.

`RegExp` will be applied to `NormalModule.request`.

`function` will be applied to `NormalModule`.

#### Example with RegExp

```js
module.exports = {
  plugins: [
    new ModifyModuleSourcePlugin({
      test: /index\.js$/
    })
  ]
};
```

#### Example with Function

```js
module.exports = {
  plugins: [
    new ModifyModuleSourcePlugin({
      test: module =>
        module.source().source().includes('my-secret-module-marker')
    })
  ]
};
```

### `modify`

Type: `(source: string, fileName: string) => string`

`Required`

Function accept a source and filename. Should return a modified source.

WARNING: modify function should make JavaScript compatible changes, for example all unsupported syntax will break your build or create errors in runtime.

#### Example

```js
module.exports = {
  plugins: [
    new ModifyModuleSourcePlugin({
      test: /my-file\.js$/,
      modify: (src, filename) =>
        src +
        `\n\n// This file (${filename}) is written by me. All rights reserved`
    })
  ]
};
```

#### Bad example (never do this)

```js
module.exports = {
  plugins: [
    new ModifyModuleSourcePlugin({
      test: /my-file\.js$/,
      modify: src => src + `haha I break your build LOL`
    })
  ]
};
```
