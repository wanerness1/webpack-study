//webpack.base.js的测试用例

const assert=require('assert') //断言库

describe('webpack.base.js test case',()=>{
    const baseConfig=require('../../lib/webpack.base')
    console.log(baseConfig);
    
    it('entry',()=>{
        assert.equal(baseConfig.entry.index,'/Users/wanzhang/study/webpack-study/build-webpack/test/smoke/template/src/index/index.js')
        assert.equal(baseConfig.entry.search,'/Users/wanzhang/study/webpack-study/build-webpack/test/smoke/template/src/search/index.js')
    })
})