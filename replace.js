/**
 * 实现更改文件名，存放到指定目录，同时更改对应文件内的url字符串！
 */
const fs = require('fs'),
      path = require('path');

/**
 * 初始搜索路径
 */
var initialurl = './original',
    /**
     * path.basename('fab/abc.html')// abc.html
     * path.extname('fab/abc.html')// .html
     * path.basename('fab/abc.html','.html')// abc
     * nameArr.includes('abc.js')// true
     * 转移文件用到此数组和fileNameOrStrToReplac和targetUrl
     */
    nameArr = ['1.txt','3.txt','abc.js'],
    /**
     * 要替换的文件名
     */
    nameToReplaceArr = ['11.txt','33.txt'],
    /**
     * path.extname(url)//得到'.html','.js'这种
     */
    extArr = ['.txt','.html'],
    /**
     * 需要修改的字符串,相同下标的值自动替换
     * 
     */
    strOriginArr = ['9','2'],
    /**
     * 用以下字符串(新文件名）去替换
     * ！！注意，如果此数组内有值和strOriginArr数组内的值相同，则还是会被替换成strToReplaceArr里对应的最终值!!
     * 
     */
    strToReplaceArr = ['11','4'],
    /**
     * 如果需要转移文件，目标文件夹路径
     */
    targetUrl = './css/';

// test searchToOperate()
/**
 * 替换字符串，或转移文件并改名
 */
var config = {
    mode: 'nameArr',
    //是否替换字符串
    replaceStr: false,
    //是否转移并更名文件，需要数组内是文件名
    renameTransfer: true
}

//功能之替换字符串
searchToOperate(initialurl,config,(absurl)=>{
    //如果需要讲修改后的文件保存一份新的到另一个地址，需要第四个参数
    if(config.replaceStr)
    replaceStr(strOriginArr,strToReplaceArr,absurl);
});

//功能实现之转移文件并改名
searchToOperate(initialurl,config,(absurl)=>{
    //转移开始
    if(config.renameTransfer)
    transferRenameFile(absurl,nameToReplaceArr,targetUrl);
})

//文件改名并复制到对应目录
function transferRenameFile(originurl,nameToReplaceArr,targetUrl){
    //找到要修改文件名对应的下标
    var filename = path.basename(originurl);
    var index = nameArr.indexOf(filename);
    var toabsurl = path.resolve(targetUrl,nameToReplaceArr[index]);
    var readable = fs.createReadStream(originurl);
    var writable = fs.createWriteStream(toabsurl);
    readable.pipe(writable);
    console.log(originurl+' is renamed & replaced to '+toabsurl);
}

//定义替换字符串操作，前面两个参数是数组
function replaceStr(nameOrigin,nameToReplace,originurl,targeturl){
    //省略第四个参数则默认在原文件修改
    targeturl = targeturl || originurl;
    //!!!此处原始目录必须已经存在
    var absurl = path.resolve(originurl);
    //!!!此处目标目录不一定需要存在
    var toabsurl = path.resolve(targeturl);
    var readable = fs.createReadStream(absurl);
    var arr = [];
    //每一次读取64kb的数据
    readable.on('data',chunk=>{
        arr.push(chunk);
    })
    readable.on('end',()=>{
        //原来的所有内容
        var originStr = Buffer.concat(arr).toString();

//遍历数组内的元素，是字符串的情形
       

        nameOrigin.forEach((origStr,index)=>{
        //所有字符串
        var regexp = new RegExp(origStr,'g');
        if(nameToReplace[index] === undefined)
        {
            throw new Error('要替换的字符串不足！');
        }
        //找到匹配的再替换
        if(originStr.search(regexp) !== -1 )
        {
            //不断修改原来的内容
            originStr = originStr.replace(regexp,nameToReplace[index]);
            console.log(absurl+' was found and replaced!');
        }
        //所有字符串都被替换完后
        if(index === nameOrigin.length-1){
            //此时可以安全创建写入流,注意end事情没有触发时是不可以同时创建写入流的,end触发后文件描述符自动关闭
            var writable = fs.createWriteStream(toabsurl);
            //写入文件
            writable.write(originStr);
        }

        })

    })
}

//test transferRenameFile();
// transferRenameFile('1.txt','2.txt','./');


//寻找目标文件,进行何种操作
function searchToOperate(url,config,operate){
    //不是目录，直接返回
    if(!fs.lstatSync(url).isDirectory()){
        throw new Error('起始路径必须是目录！')
    }
fs.readdir(url,{ encoding:'utf8',withFileTypes:true },(err,files)=>{
    if(err)throw err;
    //读每个目录选项
    files.forEach(dirent=>{
        /**
         * 此文件的绝对路径，注意一些大坑
         * fs.realpath[Sync]永远是相对于执行此脚本文件的目录而言
         * 而path.resolve()则是不断执行cd操作
         */
        var absurl = path.resolve(url,dirent.name);
        //目标选中条件,此处nameArr.includes或ext.includes条件,找到所有在nameArr里包含名字的文件
        // if(dirent.isFile() && dirent.name === config)
        if(config.mode === 'nameArr' && dirent.isFile() && nameArr.includes(dirent.name))
        {
            operate(absurl);
        }
        if(config.mode === 'extArr' && dirent.isFile() && extArr.includes(path.extname(dirent.name)))
        {
            operate(absurl);
        }
        //是文件夹的情况，进行再次遍历寻找文件
        else if(dirent.isDirectory()){
            arguments.callee(absurl,config,operate);
        }
        else
        return;
    });
 })
}
