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
const TerserPlugin =require('terser-webpack-plugin') //并行压缩，提升打包速度
// var HardSourceWebpackPlugin = require('hard-source-webpack-plugin');//缓存 todo:npm 下载失败，待下载
const PurgecssPlugin = require('purgecss-webpack-plugin') //去除无用的css，需要结合mini-css-extract-plugin使用

 
const PATHS = {
  src: path.join(__dirname, 'src')
}
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
                include:path.resolve('src'), //只解析src下的js，忽略node_modules等
                use:[
                    // {
                    //     loader:'thread-loader',//多线程打包，提速
                    //     options:{
                    //         worker:10
                    //     }
                    // },
                    // 'babel-loader'
                    'babel-loader?cacheDirectory=true' //cacheDirectory开启babel缓存，加快第二次构建速度，在node_modules下.cache文件夹中会出现babel-loader文件夹
                ]
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
                    },
                    {
                        loader: 'image-webpack-loader', //图片压缩
                        options: {
                          mozjpeg: {
                            progressive: true,
                            quality: 65
                          },
                          // optipng.enabled: false will disable optipng
                          optipng: {
                            enabled: false,
                          },
                          pngquant: {
                            quality: [0.65, 0.90],
                            speed: 4
                          },
                          gifsicle: {
                            interlaced: false,
                          },
                          // the webp option will enable WEBP
                          webp: {
                            quality: 75
                          }
                        }
                      },
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
        // new HTMLInlineCSSWebpackPlugin(),//css内联插件，需在HtmlWebpackPlugin插件后面使用，且必须结合MiniCssExtractPlugin抽出插件使用,将样式放入style标签中内联到html内
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
        // new FriendlyErrorsWebpackPlugin(),
        function(){//构建错误捕获 （webpack4写法）
            this.hooks.done.tap('done',stats=>{//this为compiler对象，构建完成时，会触发done钩子
                if(stats.compilation.errors&&stats.compilation.errors.length&&process.argv.indexOf('--watch')==-1){
                    console.log('build error');
                    //此处可执行上报逻辑等错误处理程序
                    process.exit(1) //使用非0 code传递exit中，进行抛错
                }
            })
        },
        new BundleAnalyzerPlugin(),
        new webpack.DllReferencePlugin({ //读取预编译的manifest文件，预编译的库不打入业务包
            manifest: require("./dll/library-manifest.json"), // eslint-disable-line
            name:"library"
        }),
        // new HardSourceWebpackPlugin()，
        new PurgecssPlugin({
            paths: glob.sync(`${PATHS.src}/**/*`,  { nodir: true }),
          }),
    
    ],
    optimization:{
        // splitChunks:{ //使用splitChunks分离公共库与公共代码
        //     minSize:0,
        //     cacheGroups:{//分离react和react-dom基础库
        //         vendors:{
        //             test:/(react|react-dom)/,
        //             name:'vendors',
        //             chunks:'all'
        //         },
        //         commons:{//分离公共模块
        //             name:'commons',
        //             chunks:'all',
        //             minChunks:2
        //         }        
        //     }
        // },

        minimizer:[
            new TerserPlugin({
                parallel:true,
                cache:true //开启TerserPlugin缓存
            })
        ] 


    },

    // resolve:{ //规定第三方模块查找策略，加速模块查找
    //     alias:{ //当遇到react或者react-dom时，直接从后面的路径进行查找，加快查找时间
    //         'react':path.resolve(__dirname,'./node_modules/react/umd/react.production.min.js'),
    //         'react-dom':path.resolve(__dirname,'./node_modules/react-dom/umd/react-dom.production.min.js'),
    //     },
    //     extensions:['.js'],//只查找每个模块的js文件（忽略json查找）
    //     mainFields:['main'],//只查找每个模块package.json中main规定的入口文件（忽略index等文件）

    // },

    // stats:'errors-only'
    
   
}