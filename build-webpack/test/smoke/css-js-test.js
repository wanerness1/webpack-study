//测试用例--检测是否生成html文件
const glob=require('glob-all')

describe('checking css&js files generated',()=>{
    it('should generate css&js files',(done)=>{
        const files = glob.sync([
            './dist/index_*.js',
            './dist/index_*.css',
            './dist/search_*.js',
            './dist/search_*.css',
        ])

        console.log(22222,files);
        

        if(files.length>0){
            done()
        }else{
            throw new Error('no html files')
        }
    })
})