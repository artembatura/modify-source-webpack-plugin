const { ModifySourcePlugin, ReplaceOperation } = require('modify-source-webpack-plugin');

module.exports = {
  configureWebpack: {
    plugins: [
      new ModifySourcePlugin({
        rules: [
          {
            test: /App\.vue\?vue&type=template.*/,
            operations: [
              new ReplaceOperation('all', 'Welcome to Your Vue.js App', 'Welcome to the club buddy')
            ]
          },
          {
            test: /App\.vue\?vue&type=script.*/,
            operations: [
              new ReplaceOperation('once', '// {MY_CUSTOM_CODE}', '\nconsole.log(`filepath: $FILE_PATH\nfilename: $FILE_NAME`)')
            ]
          }
        ]
      })
    ]
  }
};
