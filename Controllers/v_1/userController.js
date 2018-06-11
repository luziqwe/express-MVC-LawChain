const moment = require("moment");
const co = require('co');
const fs = require('fs');
const transliteration = require('transliteration');
const MessageXSend = require('../../libs/messageXSend');
const PlatConf = require('../../Confs/PlatConf');
const cheerio = require('cheerio');
const request = require('request');
let crypto = require('crypto');
const pingpp = require('pingpp')('');
pingpp.setPrivateKey();
//引入的Model
const userModel = require("../../Models/userModel");

//微信公众号配置
const APPID = '';
const APPSERCERT = '';
const ordered = [
    ['createdAt', 'desc']
];

/**
 * 获取这周是本月第几周
 * @param a
 * @param b
 * @param c
 * @returns {number}
 */
let getMonthWeek = function (a, b, c) {
    //a = d = 当前日期
    //b = 6 - w = 当前周的还有几天过完(不算今天)
    //a + b 的和在除以7 就是当天是当前月份的第几周
    let date = new Date(a, parseInt(b) - 1, c),
        w = date.getDay(),
        d = date.getDate();
    return Math.ceil((d + 6 - w) / 7);
};

/**
 * JSON格式返回
 * @param res response
 * @param ret 返回的键值对
 */
let jsonWrite = (res, ret) => {
    if (typeof ret === 'undefined') {
        res.json({
            code: '1',
            msg: '操作失败'
        });
    } else {
        res.json(ret);
    }
};

/**
 * 发送短信验证码
 * @param res 上传response
 * @param userTel 用户手机号
 * @param Type 存在cookie里面的值的 key
 * @returns {number} 验证码
 * @constructor
 */
let SendMessage = function (res, userTel, Type) {
    let messageXSend = new MessageXSend();
    messageXSend.add_to(userTel);
    messageXSend.set_project('');
    let Num = getRandomNum(6);
    res.cookie(Type, Num, {maxAge: 30 * 60 * 1000, httpOnly: true});
    messageXSend.add_var("code", Num);
    messageXSend.xsend();
    return 1;
};

/**
 * 生成随机len位字符串
 * @param len 长度
 * @returns {string} 随机数
 */
let getRandomString = (len) => {
    let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    let maxPos = $chars.length;
    let pwd = '';
    for (let i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
};

/**
 * 生成随机数字
 * @param size 长度
 * @returns {string} 随机数字
 */
let getRandomNum = (size) => {
    let str = '';
    for (let i = 0; i < size; i++) {
        str += Math.floor(Math.random() * 10);
        //Math.random() * 10-------0-10随机数包括浮点数
        // Math.floor再取整--返回小于或等于指定小数的最大整数。
    }
    return str;
};

/**
 * 倒序快排
 * @param prop
 * @returns {Function}
 * @constructor
 */
let FastSortDesc = function (prop) {
    return function (obj1, obj2) {
        let val1 = obj1[prop];
        let val2 = obj2[prop];
        if (val1 > val2) {
            return -1;
        } else if (val1 < val2) {
            return 1;
        } else {
            return 0;
        }
    }
};

/**
 * 正序快排
 * @param prop
 * @returns {Function}
 * @constructor
 */
let FastSortAsc = function (prop) {
    return function (obj1, obj2) {
        let val1 = Number(obj1[prop]);
        let val2 = Number(obj2[prop]);
        if (val1 < val2) {
            return -1;
        } else if (val1 > val2) {
            return 1;
        } else {
            return 0;
        }
    }
};

/**
 * 数组中是否含有某个值,返回下标
 * @param arr
 * @param value
 * @returns {number}
 */
let isHasElementOne = function(arr,value){
    for(let i = 0; i < arr.length; i++){
        if(arr[i].userID == value){
            return i;
        }
    }
    return -1;
};


module.exports = {

    /**
     * 建库
     * @param req
     * => get请求为 req.query || req.params / post请求为 req.body
     * @param res
     * @param next
     * @constructor
     */
    SetMySQL: (req, res, next) => {
        co(function* () {
            // code here
            yield userModel.user.sync({force: true});
            jsonWrite(res, {
                CheckStatus: 1,
                CheckDetail: "建库成功"
            });
        }).catch(function (err) {
            console.error(
                "捕捉到异常 --> \n" +
                "错误名称:" + err.name + " ---> \n" +
                "错误信息: " + err.message
            );
            jsonWrite(res, {
                CheckStatus: -1,
                ErrName: err.name,
                ErrMessage: err.message
            })
        });
    },

    /**
     * 上传客户端的图片文件至服务器
     * @param req
     * => 这里使用input[type=file] 进行上传, 使用 form 表单或其他形式的上传方式, 小汪汪曾经对结果,可以请教小汪汪
     * => 若使用表单上传,则设置Form标签 method='post' action='/users/user.ImageUpload'
     * => 设置input的name 为 file
     * => 该接口可能需要进行联调才能够使用, 不过你们可以先进行尝试
     * 参考代码:
     *
     <form id= "uploadForm">
     <p >指定文件名： <input type="text" name="filename" value= ""/></p >
     <p >上传文件： <input type="file" name="file"/></ p>
     <input type="button" value="上传" onclick="doUpload()" />
     </form>
     function doUpload() {
         var formData = new FormData($( "#uploadForm" )[0]);
         $.ajax({
              url: 'http://localhost:8080/cfJAX_RS/rest/file/upload' ,
              type: 'POST',
              data: formData,
              async: false,
              cache: false,
              contentType: false,
              processData: false,
              success: function (returndata) {
                  alert(returndata);
              },
              error: function (returndata) {
                  alert(returndata);
              }
         });
     }
     * @param res
     * @param next
     * @constructor
     */
    ImageUpload: (req, res, next) => {
        let _files = req.files.file;
        let item, _name, _tmp;
        item = _files, _name = item.name;
        if (_name && item.path) { //这里需要判断文件名称和路径是否为空
            let tmpPath = item.path,
                type = item.type,
                extension_name = '',
                tmp_name = (Date.parse(new Date()) / 1000) + '' + (Math.round(Math.random() * 9999)); //生成随机名称
            switch (type) { //判断文件类型
                case 'image/pjpeg':
                    extension_name = 'jpg';
                    break;
                case 'image/jpeg':
                    extension_name = 'jpg';
                    break;
                case 'image/gif':
                    extension_name = 'gif';
                    break;
                case 'image/png':
                    extension_name = 'png';
                    break;
                case 'image/x-png':
                    extension_name = 'png';
                    break;
                case 'image/bmp':
                    extension_name = 'bmp';
                    break;
                default:
                    if (_name.indexOf('.') <= 0) return; //其他文件则默认上传
                    else {
                        _tmp = _name.split('.');
                        extension_name = _tmp[_tmp.length - 1];
                        break;
                    }
            }
            tmp_name = tmp_name + '.' + extension_name,
                targetPath = 'public/images/' + tmp_name,
                is = fs.createReadStream(tmpPath),
                os = fs.createWriteStream(targetPath);
            is.pipe(os, {end: false});
            is.on('end', () => {
                jsonWrite(res, {
                    CheckStatus: 1,
                    CheckDetail: "上传图片成功",
                    url: '/images/' + tmp_name,
                });
            });
        }
        ;
    }

};
