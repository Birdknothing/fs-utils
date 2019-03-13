/**
 * 实现更改文件名，存放到指定目录，同时更改对应文件内的url字符串！
 */
const fs = require('fs'),
      path = require('path');

var url = './test',
    /**
     * path.basename('fab/abc.html')// abc.html
     * path.basename('fab/abc.html','.html')// abc
     * nameArr.includes('abc.js')// true
     * 
     */
    nameArr = ['1.txt','example.html','abc.js'],
    /**
     * path.extname(url)//得到'.html','.js'这种
     * 
     */
    ext = ['.js','.html'],
    /**
     * 需要修改的字符串以及文件名
     */
    fileNameOrigin = ['sfb专属.png'],
    /**
     * 用以下字符串(新文件名）去替换
     */
    fileNameToReplace = ['customize.png'],
    /**
     * 目标文件夹路径
     */
    targetUrl = './css/';

//替换字符串操作
function replaceStr(nameOrigin,nameToReplace,originurl,targeturl){
    targeturl = targeturl || originurl;
    var absurl = fs.realpathSync(originurl);
    var toabsurl = fs.realpathSync(targeturl);
    var readable = fs.createReadStream(absurl);
    var arr = [];
    //每一次读取64kb的数据
    readable.on('data',chunk=>{
        arr.push(chunk);
        // console.log(chunk.toString());
    })
    readable.on('end',()=>{
        //原来的所有内容
        var originStr = Buffer.concat(arr).toString();
        var regexp =new RegExp(nameOrigin,'g');
        //改变后的内容
        var changedStr = originStr.replace(regexp,nameToReplace);
        //此时可以安全创建写入流,注意end事情没有触发时是不可以同时创建写入流的,end触发后文件描述符自动关闭
        var writable = fs.createWriteStream(toabsurl,{flags:''});
        //写入文件
        writable.write(changedStr);
    })
}
replaceStr('d','e','./1.txt','./2.txt');
// //字符串批量替换
// fileNameToReplace.forEach( newFileName =>{
// var targetFile = fs.createWriteStream(targetUrl+newFileName);
// console.log(readble.read(10));
// readble.on('data',chunk=>{
//     console.log('concat' in chunk)
//     console.log(chunk.toString())
//     console.log(readble.bytesRead)
// })

// });
//文件改名并复制到对应目录
function transferRenameFile(){

}
//寻找目标文件,进行何种操作
function readDirectory(url,operate){
fs.readdir(url,{ encoding:'utf8',withFileTypes:true },(err,files)=>{
    //读每个目录选项
    files.forEach(dirent=>{
        //此文件的绝对路径
        var absurl = fs.realpathSync(dirent.name);
        //目标选中条件,此处nameArr.includes或ext.includes条件,找到所有在nameArr里包含名字的文件
        if(dirent.isFile() && nameArr.includes(dirent.name))
        {
            operate(absurl);
        }
        //是文件夹的情况，进行再次遍历寻找文件
        if(dirent.isDirectory()){
            readDirectory(absurl,operate);
        }
    });
 })
}
// replaceStr();
// readDirectory(url);