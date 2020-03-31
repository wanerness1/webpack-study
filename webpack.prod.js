'use strict'

const path=require('path')
const webpack=require('webpack')
const MiniCssExtractPlugin=require('mini-css-extract-plugin') //抽出css
const HtmlWebpackPlugin = require('html-webpack-plugin') //生成html
const optimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')//css压缩
const { CleanWebpackPlugin } = require('clean-webpack-plugin'); //清空dist
const HTMLInlineCSSWebpackPlugin = require("html-inline-css-webpack-plugin").default;
const glob=require('glob')
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin') //抽出公共库
const FriendlyErrorsWebpackPlugin =require('friendly-errors-webpack-plugin')//优化webpack日志，配合 stats:'errors-only'使用
const SpeedMeasureWebpackPlugin =require('speed-measure-webpack-plugin')
const {BundleAnalyzerPlugin} =require('webpack-bundle-analyzer') //打包产物体积分析

var smp=new SpeedMeasureWebpackPlugin()

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
            chunks:[entryName,'vendors','commons'],//每个被splitChunks分离出来的公共代码成为一个新chunk，必须在这里注入
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

module.exports={
    entry:entry,
    output:{
        path:path.join(__dirname,'dist'),
        filename:'[name]_[chunkhash:8].js' //文件指纹
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
        ...htmlWebpackPlugins,
        new HTMLInlineCSSWebpackPlugin(),//css内联插件，需在HtmlWebpackPlugin插件后面使用，且必须结合MiniCssExtractPlugin抽出插件使用,将样式放入style标签中内联到html内
        new CleanWebpackPlugin(),//清空dist
        new webpack.optimize.ModuleConcatenationPlugin(),//开启scope hoisting,mode为production时默认开启
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
        // }),
        new FriendlyErrorsWebpackPlugin(),
        function(){//构建错误捕获 （webpack4写法）
            this.hooks.done.tap('done',stats=>{//this为compiler对象，构建完成时，会触发done钩子
                if(stats.compilation.errors&&stats.compilation.errors.length&&process.argv.indexOf('--watch')==-1){
                    console.log('build error');
                    //此处可执行上报逻辑等错误处理程序
                    process.exit(1) //使用非0 code传递exit中，进行抛错
                }
            })
        },
        new BundleAnalyzerPlugin() 
    
    ],
    optimization:{
        splitChunks:{ //使用splitChunks分离公共库与公共代码
            minSize:0,
            cacheGroups:{//分离react和react-dom基础库
                vendors:{
                    test:/(react|react-dom)/,
                    name:'vendors',
                    chunks:'all'
                },
                commons:{//分离公共模块
                    name:'commons',
                    chunks:'all',
                    minChunks:2
                }        
            }
        }
    },
    stats:'errors-only'
    
   
}