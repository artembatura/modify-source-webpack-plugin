# modify-source-webpack-plugin

Webpack Plugin for modifying modules source.

## Compatibility

| Webpack Version | Plugin version | Status                   |
| --------------- | -------------- | ------------------------ |
| ^5.0.0          | ^4.0.0-beta.1  | <p align="center">✅</p> |
| ^4.37.0         | ^4.0.0-beta.1  | <p align="center">✅</p> |

## [Migration guide](https://github.com/artemirq/modify-source-webpack-plugin/blob/master/CHANGELOG.md#migration-guide-3x-to-4x) from version 3

## Installation

### NPM

```
npm i -D modify-source-webpack-plugin@next
```

### Yarn

```
yarn add -D modify-source-webpack-plugin@next
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

### `rules[].test`

Type: `RegExp | ((module: webpack.NormalModule) => boolean)`

`Required`

`test` is RegExp or function, which used to determinate which modules should be modified.

`RegExp` will be applied to full module path (based on `userRequest`).

`function` will be applied to `NormalModule`.

#### Example with RegExp

```js
plugins: [
  new ModifySourcePlugin({
    rules: [
      {
        test: /index\.js$/
      }
    ]
  })
];
```

#### Example with Function

```js
plugins: [
  new ModifySourcePlugin({
    rules: [
      {
        test: module =>
          module.source().source().includes('my-secret-module-marker')
      }
    ]
  })
];
```

### `rules[].operations`

Type: `AbstractOperation[]` (supported `ConcatOperation`, `ReplaceOperation`)

`Required`

List of operations which describes how modules should be modified.

:warning: Operations should make syntax compatible changes. For example all unsupported syntax will break your build or create errors in runtime.

#### Example with concat operation

```js
import {
  ModifySourcePlugin,
  ConcatOperation
} from 'modify-source-webpack-plugin';

module.exports = {
  plugins: [
    new ModifySourcePlugin({
      rules: [
        {
          test: /my-file\.js$/,
          operations: [
            new ConcatOperation(
              'start',
              '// Proprietary and confidential.\n\n'
            ),
            new ConcatOperation(
              'end',
              '\n\n// File is written by me, January 2022'
            )
          ]
        }
      ]
    })
  ]
};
```

#### Example with replace operation

```js
import {
  ModifySourcePlugin,
  ReplaceOperation
} from 'modify-source-webpack-plugin';

module.exports = {
  plugins: [
    new ModifySourcePlugin({
      rules: [
        {
          test: /my-file\.js$/,
          operations: [
            new ReplaceOperation('once', 'searchValue', 'replaceValue'),
            new ReplaceOperation('all', 'searchValue', 'replaceValue')
          ]
        }
      ]
    })
  ]
};
```

#### Bad example

```js
module.exports = {
  plugins: [
    new ModifySourcePlugin({
      rules: [
        {
          test: /my-file\.js$/,
          operations: [
            new ConcatOperation('start', 'Haha I break your build LOL')
          ]
        }
      ]
    })
  ]
};
```

### `debug`

Type: `boolean`

For easier debugging. Print some logs in the console.

## Advanced Usage

### Compile-time constants

Constants related to information about files that we change.

| Constant     | Description  |
| ------------ | ------------ |
| `$FILE_PATH` | Path to file |
| `$FILE_NAME` | File name    |

```js
plugins: [
  new ModifySourcePlugin({
    rules: [
      {
        test: /my-file\.js$/,
        operations: [
          new ConcatOperation(
            'end',
            '\n\n // This file is on the path - $FILE_PATH and filename - $FILE_NAME'
          )
        ]
      }
    ]
  })
];
```

### Put content before and after file contents

<details>
  <summary>my-file.js (clickable)</summary>

```js
console.log('Hello world!');
```

</details>

`webpack.config.js`

```js
plugins: [
  new ModifySourcePlugin({
    rules: [
      {
        test: /my-file\.js$/,
        operations: [
          new ConcatOperation('start', '// Something before file contents.\n'),
          new ConcatOperation('end', '\n// Something after file contents.')
        ]
      }
    ]
  })
];
```

<details>
  <summary>Result my-file.js (clickable)</summary>

```js
// Something before file contents.
console.log('Hello world!');
// Something after file contents.
```

</details>

### Replace plug with a content

<details>
  <summary>my-component.jsx (clickable)</summary>

```jsx
function HelloMessage(props) {
  return (
    <div>
      Hello, $NAME
      <button
        onClick={() => {
          props.userLogout();
          alert('Goodbye, $NAME!');
        }}
      >
        $EXIT_LABEL
      </button>
    </div>
  );
}
```

</details>

`webpack.config.js`

```js
plugins: [
  new ModifySourcePlugin({
    rules: [
      {
        test: /my-file\.jsx$/,
        operations: [
          new ReplaceOperation('all', '$NAME', 'Artem Batura'),
          new ReplaceOperation('once', '$EXIT_LABEL', 'Exit')
          // new ReplaceOperation('once', '$EXIT_LABEL', 'Leave')
        ]
      }
    ]
  })
];
```

<details>
  <summary>Result my-component.jsx (clickable)</summary>

```jsx
function HelloMessage(props) {
  return (
    <div>
      Hello, Artem Batura
      <button
        onClick={() => {
          props.userLogout();

          alert('Goodbye, Artem Batura!');
        }}
      >
        Exit
      </button>
    </div>
  );
}
```

</details>

### Place code/text fragment in required position

<details>
  <summary>my-component.jsx (clickable)</summary>

```jsx
function HelloMessage(props) {
  $MY_DEBUG_CODE;

  return (
    <div>
      Hello, user! $MY_USER_COMPONENT
      <button onClick={() => props.userLogout()}>Exit</button>
    </div>
  );
}
```

</details>

`webpack.config.js`

```js
plugins: [
  new ModifySourcePlugin({
    rules: [
      {
        test: /my-file\.js$/,
        operations: [
          new ReplaceOperation(
            'once',
            '$MY_DEBUG_CODE',
            'console.log("props", props)'
          ),
          new ReplaceOperation(
            'once',
            '$MY_USER_COMPONENT',
            '<div>compilation-time markup</div>'
          )
        ]
      }
    ]
  })
];
```

<details>
  <summary>Result my-component.jsx (clickable)</summary>

```jsx
function HelloMessage(props) {
  console.log('props', props);

  return (
    <div>
      Hello, user!
      <div>compilation-time markup</div>
      <button onClick={() => props.userLogout()}>Exit</button>
    </div>
  );
}
```

</details>
