const path = require('path');
const webpack=require('webpack')
const { CleanWebpackPlugin } = require('clean-webpack-plugin') //打包时自动清理dist文件夹

module.exports = {
  entry:{
    index:'./src/index.js',
    search:'./src/search.js'
  },
  output:{
    // path:'/web-dev-server',
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
    new CleanWebpackPlugin()
  ],
  devServer:{
    // contentBase:'', //不配置contentBase时，以当前根目录作为服务器，所以在根目录下放置index.html
    hot:true
  }

}
