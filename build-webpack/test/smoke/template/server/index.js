
//用于hack window 报错
if(typeof window === 'undefined'){
    global.window={}
}



const express=require('express')
const {renderToString}=require('react-dom/server') //将客户端组件渲染成字符串并返回

const SSRComp=require('../dist/search-server')//用于ssr的组件

console.log(SSRComp);



 
const server=(port)=>{
    const app=express(); 

    app.use(express.static('dist')) //提供静态目录

    app.get('/search',(req,res)=>{
        const html=renderMarkup(renderToString(SSRComp))
        console.log(html);
        console.log(renderToString(SSRComp));
        console.log(1111);
        
        
        
        res.status(200).send(html)
    })
  
    app.listen(port,()=>{
        console.log('server is running on port:'+port);
        
    })
}
 
const renderMarkup=(str)=>{
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Document</title>
    </head>
    <body>
        <div id='root'>${str}</div>
    </body>
    </html>`
}


server(process.env.PORT||3000)