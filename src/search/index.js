import React from "react";
import ReactDOM from "react-dom";
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
   
   importDynamic(){
       //动态import,webpack会将该内容分割成独立js文件，在点击时通过jsonp动态加载到html中
        import('./DynamicComp').then(DynamicComp=>{
            this.setState({
                DynamicComp:DynamicComp.default
            })
        })
   }
    render(){
        const {DynamicComp} = this.state
        const resA=a() //a函数运行结果未使用，被tree-shaking清除掉，a函数不会打入包中
        return <div  className='color'>
            im search miao 11
            <img src={cat} width={200} height={200} onClick={this.importDynamic.bind(this)}/>
            {common()}
            {DynamicComp?<DynamicComp/>:null}
            </div>
    }
}

ReactDOM.render(
    <Search/>,
    document.getElementById('root')
)

