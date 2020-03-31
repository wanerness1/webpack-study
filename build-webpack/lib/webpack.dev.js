/* dev包括 ：
    1.热更新
    2.sourcemap
*/

const merge = require('webpack-merge');
const webpack = require('webpack');

const baseConfig = require('./webpack.base');

const devConfig = {
  mode: 'development',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
  ],
  devServer: {
    contentBase: './dist', // 不配置contentBase时，以当前根目录作为服务器，所以在根目录下放置index.html
    hot: true,
    stats: 'errors-only',
  },
  devtool: 'cheap-source-map',
};

module.exports = merge(baseConfig, devConfig);
