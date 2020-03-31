
/* base文件包含：
    1.资源解析（loaders），css前缀，px转rem等
    2.文件夹清理
    3.多页面打包
    4.命令行显示优化，错误捕获
    5.css提取单独文件
*/

const path = require('path');
const glob = require('glob');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin'); // 生成html
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');// 优化webpack日志，配合 stats:'errors-only'使用
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // 抽出css
const autoprefixer = require('autoprefixer');

const projectRoot = process.cwd()//项目运行时实际目录
console.log(111111,projectRoot);


function setMPA() { // 多页面entry与HtmlWebpackPlugin生成函数
  const entry = {};
  const htmlWebpackPlugins = [];
  const entryFiles = glob.sync(path.join(projectRoot, './src/*/index.js'));

  console.log(entryFiles); //eslint-disable-line
  entryFiles.map((entryfile) => {
    const entryName = entryfile.match(/src\/(.*)\/index/)[1];
    entry[entryName] = entryfile;

    const htmlWebpackPlugin = new HtmlWebpackPlugin({ // 生成html插件，有压缩功能
      template: path.join(projectRoot, `src/${entryName}/index.html`),
      filename: `${entryName}.html`,
      chunks: [entryName],
      inject: true,
      minify: {
        html5: true,
        collapseWhitespace: true,
        preserveLineBreaks: false,
        minifyCSS: true,
        minifyJS: true,
        removeComments: true,
      },
    });

    return htmlWebpackPlugins.push(htmlWebpackPlugin);
  });

  return {
    entry,
    htmlWebpackPlugins,
  };
}

const { entry, htmlWebpackPlugins } = setMPA();

module.exports = {
  entry,
  output:{
    path:path.join(projectRoot,'dist'),
    filename:'[name]_[chunkhash:8].js' //文件指纹
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
      },
      {
        test: /.css$/,
        use: [
          // 使用MiniCssExtractPlugin，与style-loader冲突,
          // 'style-loader', //style-loader使打包后的js动态生成style标签并插入
          MiniCssExtractPlugin.loader, // 当使用了MiniCssExtractPlugin抽出插件后，需使用该loader
          'css-loader',
          {
            loader: 'postcss-loader', // css处理loader
            options: {
              plugins: () => [autoprefixer({ // 添加c3前缀 -ms-等
                Browserslist: ['last 2 version', '>1%', 'ios 7'], // 制定要兼容到的版本,用户率，系统
              })],
            },
          },
          {
            loader: 'px2rem-loader', // 将css中的px自计算动转换成rem, 完整的px转rem还需要借助lib-fexible库根据设备大小动态设定rem值（font-size）
            options: {
              remUnit: 75, // 规定设计稿的1rem=75px
              remPrecision: 8, // 规定px换算到rem的精确度（小数后8位）
            },
          },
        ],
      },
      {
        test: /.(png|jpg|git|jpeg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name]_[hash:8].[ext]', // 根据内容生成hash
            },
          },
        ],
      },
    ],
  },

  plugins: [
    ...htmlWebpackPlugins,
    new MiniCssExtractPlugin({ // 抽出独立css插件
      filename: '[name]_[contenthash:8].css', // 根据内容生成hash
    }),
    new CleanWebpackPlugin(),
    new FriendlyErrorsWebpackPlugin(),
    function errorPlugin() { // 构建错误捕获 （webpack4写法）
      this.hooks.done.tap('done', (stats) => { // this为compiler对象，构建完成时，会触发done钩子
        if (stats.compilation.errors && stats.compilation.errors.length && process.argv.indexOf('--watch') === -1) {
          console.log('build error'); //eslint-disable-line
          // 此处可执行上报逻辑等错误处理程序
          process.exit(1); // 使用非0 code传递exit中，进行抛错
        }
      });
    },
  ],

  stats: 'errors-only',


};
