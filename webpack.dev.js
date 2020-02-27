const path = require('path');
const webpack=require('webpack')

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
                'css-loader'
            ]
        },
        {
            test:/.(png|jpg|git|jpeg)$/,
            use:'file-loader'
        }
    ]
  },
  plugins:[
    new webpack.HotModuleReplacementPlugin()
  ],
  devServer:{
    // contentBase:'', //不配置contentBase时，以当前根目录作为服务器，所以在根目录下放置index.html
    hot:true
  }

}
