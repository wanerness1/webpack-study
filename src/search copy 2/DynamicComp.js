import React from "react";
import ReactDOM from "react-dom";

console.log(ReactDOM)

class DynamicComp extends React.Component{
    render(){
        return <div>动态引入组件</div>
    }
}
export default DynamicComp