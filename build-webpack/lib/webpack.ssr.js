/*
    ssr:
*/

const merge = require('webpack-merge');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
// const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin'); // 抽出公共库
const cssProcessor = require('cssnano');

const baseConfig = require('./webpack.base');

const prodConfg = {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: 'ignore-loader',
      },
      {
        test: /\.less$/,
        use: 'ignore-loader',
      },
    ],
  },
  plugins: [
    new OptimizeCssAssetsWebpackPlugin({ // css压缩
      assetNameRegExp: /\.css$/g,
      cssProcessor,
    }),
    // new HtmlWebpackExternalsPlugin({//将react和react-dom使用cdn方式引入，不打入bundle中
    //     externals:[
    //         {
    //             module:'react',
    //             entry:'//11.url.cn/now/lib/15.1.0/react-with-addons.min.js?_bid=3123',
    //             global:'React'
    //         },{
    //             module:'react-dom',
    //             entry:'//11.url.cn/now/lib/15.1.0/react-dom.min.js?_bid=3123',
    //             global:'ReactDOM'
    //         }
    //     ]
    // })

  ],
  optimization: {
    splitChunks: { // 使用splitChunks分离公共库与公共代码
      minSize: 0,
      cacheGroups: { // 分离react和react-dom基础库
        vendors: {
          test: /(react|react-dom)/,
          name: 'vendors',
          chunks: 'all',
        },
        commons: { // 分离公共模块
          name: 'commons',
          chunks: 'all',
          minChunks: 2,
        },
      },
    },
  },
};

module.exports = merge(baseConfig, prodConfg);
