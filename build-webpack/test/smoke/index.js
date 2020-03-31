//构建测试

const path=require('path')
const webpack=require('webpack')
const rimraf=require('rimraf')//文件夹清理
const Mocha=require('mocha')

const mocha=new Mocha({
    timeout:'10000ms'
})

process.chdir(path.join(__dirname,'template')) //进入template下

rimraf('./dist',()=>{
    const prodConfig=require('../../lib/webpack.prod')

    //使用webpack函数进行构建
    webpack(prodConfig,(err,stats)=>{
        if(err){
            console.error(err)
            process.exit(2)
        }
        console.log(stats.toString({
            colors:true,
            modules:false,
            children:false
        }));

        //添加测试用例，进行html，css，js文件测试
        console.log('begin file testing');

        mocha.addFile(path.join(__dirname,'html-test.js'))
        mocha.addFile(path.join(__dirname,'css-js-test.js'))

        mocha.run()
        
    })
})