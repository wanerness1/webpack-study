//测试用例--检测是否生成html文件
const glob=require('glob-all')

describe('checking html files generated',()=>{
    it('should generate html files',(done)=>{
        const files = glob.sync([
            './dist/index.html',
            './dist/search.html'
        ])

        console.log(22222,files);
        

        if(files.length>0){
            done()
        }else{
            throw new Error('no html files')
        }
    })
})