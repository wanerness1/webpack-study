'use strict'

const path=require('path')
const webpack=require('webpack')
const MiniCssExtractPlugin=require('mini-css-extract-plugin') //抽出css
const HtmlWebpackPlugin = require('html-webpack-plugin') //生成html
const optimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')//css压缩
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HTMLInlineCSSWebpackPlugin = require("html-inline-css-webpack-plugin").default;

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
                    // 'style-loader', //使用MiniCssExtractPlugin，与style-loader冲突,style-loader使打包后的js动态生成style标签并插入
                    MiniCssExtractPlugin.loader, //当使用了MiniCssExtractPlugin抽出插件后，需使用该loader
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
                        loader:'px2rem-loader',//将css中的px自计算动转换成rem, 完整的px转rem还需要借助lib-fexible库根据设备大小动态设定rem值（font-size）
                        options:{
                            remUnit:75,//规定设计稿的1rem=75px
                            remPrecision:8 //规定px换算到rem的精确度（小数后8位）
                        }
                    }
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
        new MiniCssExtractPlugin({ //抽出独立css插件
            filename:'[name]_[contenthash:8].css' //根据内容生成hash
        }),
        new optimizeCssAssetsWebpackPlugin({//css压缩
            assetNameRegExp:/\.css$/g,
            cssProcessor:require('cssnano')
        }),
        new HtmlWebpackPlugin({//生成html插件，有压缩功能
            template:path.join(__dirname,'src/htmltemp/index.html'),
            filename:'index.html',
            chunks:['index'],
            inject:true,
            // minify:{
            //     html5:true,
            //     collapseWhitespace:true,
            //     preserveLineBreaks:false,
            //     minifyCSS:true,
            //     minifyJS:true,
            //     removeComments:true
            // }
        }),
        new HtmlWebpackPlugin({
            template:path.join(__dirname,'src/htmltemp/search.html'),
            filename:'search.html',
            chunks:['search'],
            inject:true,
            // minify:{
            //     html5:true,
            //     collapseWhitespace:true,
            //     preserveLineBreaks:false,
            //     minifyCSS:true,
            //     minifyJS:true,
            //     removeComments:true
            // }
        }),

        new HTMLInlineCSSWebpackPlugin(),//css内联插件，需在HtmlWebpackPlugin插件后面使用，且必须结合MiniCssExtractPlugin抽出插件使用
        new CleanWebpackPlugin() //清空dist
       

    ],
   
}