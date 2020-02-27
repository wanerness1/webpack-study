import React from "react";
import reactDOM from "react-dom";
import  "./search.css";
import cat from "./img/cat.jpg";

class Search extends React.Component{
    render(){
        return <div  className='color'>
            im search miao111
            <img src={cat} width={200} height={200}/>
            </div>
    }
}

reactDOM.render(
    <Search/>,
    document.getElementById('root')
)