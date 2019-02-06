# modify-source-webpack-plugin

Webpack Plugin, which modifying source of modules

## Getting started

### Installation

#### NPM

```
npm i -D modify-source-webpack-plugin
```

#### Yarn

```
yarn add -D modify-source-webpack-plugin
```

### Import

#### ES6/TypeScript

```js
import { ModifyModuleSourcePlugin } from 'modify-source-webpack-plugin';
```

#### CJS

```js
const { ModifyModuleSourcePlugin } = require('modify-source-webpack-plugin');
```

### Using

**webpack.config.js**

```js
module.exports = {
  plugins: [new ModifyModuleSourcePlugin(options)]
};
```

### Options

#### `test`

Type: `RegExp | ((module: compilation.Module | any) => boolean)`

Default: `undefined`

`Required`

RegExp or function, which used to find need module(s). Applies to `module.userRequest`

##### Example

```js
module.exports = {
  plugins: [
    new ModifyModuleSourcePlugin({
      test: /index\.js$/
    })
  ]
};
```

#### `modify`

Type: `(source: string, fileName: string) => string`

Default: `undefined`

`Required`

Function, which accept source and filename and should return a modified source

##### Example

```js
module.exports = {
  plugins: [
    new ModifyModuleSourcePlugin({
      modify: (src, fileName) =>
        src +
        `\nThis file (${fileName}) is written by artemir. All rights reserved`
    })
  ]
};
```

#### `findFirst`

Type: `boolean`

Default: `undefined`

If equals `false` or not setted, modifies all modules, which approach by `test` option.
If equals `true`, modifies first found module source
