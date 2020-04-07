// 预编译文件，提取公共包，先build这个，再build业务代码
var path = require("path");
const webpack=require('webpack')
module.exports = {
	entry: {
		library: ["react", "react-dom"] //将react，react-dom抽出，进行预编译
	},
	output: {//指定编译后的文件名和路径
		path: path.join(__dirname, "dll"), 
		filename: "[name].dll.js", 
		library: "[name]"
	},
	plugins: [
		new webpack.DllPlugin({ //指定manifest文件，manifest文件记录了每个库对应的索引，供业务代码打包时查询
			path: path.join(__dirname, "dll", "[name]-manifest.json"), 
			name: "[name]"
		})
	]
};