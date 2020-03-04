import React from "react";
import ReactDOM from "react-dom";
import  "./search.css";
import cat from "./img/cat.jpg";
import { a } from "./tree-shaking";

import {common} from '../../common/common'

class Search extends React.Component{
    render(){
        const resA=a() //a函数运行结果未使用，被tree-shaking清除掉，a函数不会打入包中
        return <div  className='color'>
            im search miao 11
            <img src={cat} width={200} height={200}/>
            {common()}
            </div>
    }
}

ReactDOM.render(
    <Search/>,
    document.getElementById('root')
)