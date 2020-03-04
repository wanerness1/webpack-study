const path=require('path')
const webpack=require('webpack')
const MiniCssExtractPlugin=require('mini-css-extract-plugin') //抽出css
const HtmlWebpackPlugin = require('html-webpack-plugin') //生成html
const optimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')//css压缩
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); //清空dist
const HTMLInlineCSSWebpackPlugin = require("html-inline-css-webpack-plugin").default;
const glob=require('glob')

function setMPA(){//多页面entry与HtmlWebpackPlugin生成函数
  const entry={}
  const htmlWebpackPlugins=[]
  const entryFiles=glob.sync(path.join(__dirname,'./src/*/index.js'))

  console.log(entryFiles);
  entryFiles.map(entryfile=>{
      const entryName=entryfile.match(/src\/(.*)\/index/)[1]
      entry[entryName]=entryfile

      const htmlWebpackPlugin=new HtmlWebpackPlugin({//生成html插件，有压缩功能
          template:path.join(__dirname,`src/${entryName}/index.html`),
          filename:`${entryName}.html`,
          chunks:[entryName],
          inject:true,
          minify:{
              html5:true,
              collapseWhitespace:true,
              preserveLineBreaks:false,
              minifyCSS:true,
              minifyJS:true,
              removeComments:true
          }
      })

      htmlWebpackPlugins.push(htmlWebpackPlugin)
  })

  return {
      entry,
      htmlWebpackPlugins
  }
  
}

const {entry,htmlWebpackPlugins}=setMPA()
module.exports = {
  entry:entry,
  output:{
    // path:path.join(__dirname,'dist'),
    filename:'[name].js'
  },
  mode:"development",
  module:{
    rules:[
        {
            test:/\.js$/,
            use:'babel-loader'
        },
        {
            test:/.css$/,
            use:[
                'style-loader',
                'css-loader',
                {
                  loader:'postcss-loader',//css处理loader
                  options:{
                      plugins:()=>[require('autoprefixer')({//添加c3前缀 -ms-等
                          Browserslist:['last 2 version','>1%','ios 7'] //制定要兼容到的版本,用户率，系统
                      })]
                  }
              },
              {
                  loader:'px2rem-loader',//将css中的px自计算动转换成rem
                  options:{
                      remUnit:75,//规定设计稿的1rem=75px
                      remPrecision:8 //规定px换算到rem的精确度（小数后8位）
                  }
              }
            ]
        },
        {
            test:/.(png|jpg|git|jpeg)$/,
            use:'file-loader'
        }
    ]
  },
  plugins:[
    
    new webpack.HotModuleReplacementPlugin(),
    ...htmlWebpackPlugins,
    new CleanWebpackPlugin(),
    
  ],
  devServer:{
    // contentBase:'./dist', //不配置contentBase时，以当前根目录作为服务器，所以在根目录下放置index.html
    hot:true
  },
  devtool:'cheap-source-map'

}
