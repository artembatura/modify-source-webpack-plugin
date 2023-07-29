const { ModifySourcePlugin, ReplaceOperation } = require('modify-source-webpack-plugin');

module.exports = {
  configureWebpack: {
    plugins: [
      new ModifySourcePlugin({
        rules: [
          {
            test: /App\.vue\?vue&type=template.*/,
            operations: [
              new ReplaceOperation('Welcome to Your Vue.js App', 'Welcome to the club, $NAME', 'all')
            ]
          },
          {
            test: /App\.vue\?vue&type=script.*/,
            operations: [
              new ReplaceOperation('// {MY_CUSTOM_CODE}', '\nconsole.log(`filepath: $FILE_PATH\nfilename: $FILE_NAME`)', 'all')
            ]
          }
        ],
        constants: {
          NAME: 'buddy'
        }
      })
    ]
  }
};
