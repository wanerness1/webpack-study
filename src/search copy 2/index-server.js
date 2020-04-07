// import React from "react";
// import ReactDOM from "react-dom";
const React = require('React')
import  "./search.css";
import cat from "./img/cat.jpg";
import { a } from "./tree-shaking";

import {common} from '../../common/common'

class Search extends React.Component{
    constructor(){
        super()
        this.state={
            DynamicComp:null
        }
    }
   
   
    render(){
        const {DynamicComp} = this.state
        const resA=a() //a函数运行结果未使用，被tree-shaking清除掉，a函数不会打入包中
        return <div  className='color' >
            im search miao 11
            <img src={cat} width={200} height={200} />
            {common()}
            {DynamicComp?<DynamicComp/>:null}
            </div>
    }
}

module.exports=<Search />
// module.exports='11111'

// module.exports='111'
