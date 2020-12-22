# modify-source-webpack-plugin

Webpack Plugin for modifying modules source.

## Compatibility

| Webpack Version | Plugin version | Status                   | Branch                                                                         |
| --------------- | -------------- | ------------------------ | ------------------------------------------------------------------------------ |
| ^5.0.0          | ^2.0.0         | <p align="center">✅</p> | [master](https://github.com/artemirq/modify-source-webpack-plugin/tree/master) |
| ^4.37.0         | ^1.1.0         | <p align="center">✅</p> | [1.x](https://github.com/artemirq/modify-source-webpack-plugin/tree/1.x)       |

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
import { ModifySourcePlugin } from 'modify-source-webpack-plugin';
```

### CJS

```js
const { ModifySourcePlugin } = require('modify-source-webpack-plugin');
```

## Usage

**webpack.config.js**

```js
module.exports = {
  plugins: [new ModifySourcePlugin(options)]
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
    new ModifySourcePlugin({
      test: /index\.js$/
    })
  ]
};
```

#### Example with Function

```js
module.exports = {
  plugins: [
    new ModifySourcePlugin({
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
    new ModifySourcePlugin({
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
    new ModifySourcePlugin({
      test: /my-file\.js$/,
      modify: src => src + `haha I break your build LOL`
    })
  ]
};
```
