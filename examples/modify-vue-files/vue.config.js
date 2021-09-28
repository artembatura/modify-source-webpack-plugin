const { ModifySourcePlugin } = require('modify-source-webpack-plugin');

module.exports = {
  configureWebpack: {
    plugins: [
      new ModifySourcePlugin({
        rules: [
          {
            test: /App\.vue\?vue.*/,
            modify: (src) => {
              return src.replace('Welcome to Your Vue.js App', 'Welcome to the club buddy');
            }
          }
        ]
      })
    ]
  }
};
