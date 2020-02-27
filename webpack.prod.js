'use strict'

const path=require('path')
const webpack=require('webpack')
const MiniCssExtractPlugin=require('mini-css-extract-plugin') //抽出css
const HtmlWebpackPlugin = require('html-webpack-plugin') //生成html
const optimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')

module.exports={
    entry:{
        index:'./src/index.js',
        search:'./src/search.js'
    },
    output:{
        path:path.join(__dirname,'dist'),
        filename:'[name]_[chunkhash:8].js'
        // filename:'[name].js'
    },
    mode:'production',
    module:{
        rules:[
            {
                test:/\.js$/,
                use:'babel-loader'
            },
            {
                test:/.css$/,
                use:[
                    // 'style-loader', //使用MiniCssExtractPlugin，与style-loader冲突
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test:/.(png|jpg|git|jpeg)$/,
                use:[
                    {
                        loader:'file-loader',
                        options:{
                            name:'[name]_[hash:8].[ext]' //根据内容生成hash 
                        }
                    }
                ]
            }
        ]
    },
    plugins:[
        new MiniCssExtractPlugin({
            filename:'[name]_[contenthash:8].css' //根据内容生成hash
        }),
        new optimizeCssAssetsWebpackPlugin({
            assetNameRegExp:/\.css$/g,
            cssProcessor:require('cssnano')
        }),
        new HtmlWebpackPlugin({
            template:path.join(__dirname,'src/htmltemp/index.html'),
            filename:'index.html',
            chunks:['index'],
            inject:true,
            minify:{
                html5:true,
                collapseWhitespace:true,
                preserveLineBreaks:false,
                minifyCSS:true,
                minifyJS:true,
                removeComments:true
            }
        }),
        new HtmlWebpackPlugin({
            template:path.join(__dirname,'src/htmltemp/search.html'),
            filename:'search.html',
            chunks:['search'],
            inject:true,
            minify:{
                html5:true,
                collapseWhitespace:true,
                preserveLineBreaks:false,
                minifyCSS:true,
                minifyJS:true,
                removeComments:true
            }
        }),
    ],
   
}