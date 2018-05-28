
var forEach = require('async-foreach').forEach;
var logger = require('../winston');
var pool = require('../mysql');
var Promise = require('promise');

var emptylist = {"result" : "empty"};


exports.getNotice = async function (data, callback) {

    try{

        const connection = await getPoolConnection();
        const getNoticeListPromise = await getNoticeList(connection);
        const responseNoticeListPromise = await responseNoticeList(getNoticeListPromise);
        logger.log('debug','noticeList : %j',responseNoticeListPromise);
        callback(null,responseNoticeListPromise);

    }catch (e) {
        callback(e,null);
    }
};


async function getPoolConnection(){

    return new Promise(function(resolve,reject){

        pool.getConnection(function(err,connection){

            if(err){connection.release(); reject(err);}

            resolve(connection);
        })

    })
}

async function getNoticeList(connection){

    return new Promise(function(resolve,reject){

        var noticeListSql = "select * from notice";

        connection.query(noticeListSql,function(err,noticeList){
            if(err){connection.release(); reject(err);}

            connection.release();
            resolve(noticeList);
        })
    })
}

async function responseNoticeList(noticeListPromise){

    return new Promise(function(resolve,reject){

        var obj = [];

        if(noticeListPromise == null || noticeListPromise.length ==0){
            resolve(emptylist);
        }

        forEach(noticeListPromise,function(item,index,arr){

            var objTemp = {
                "notice_id" : noticeListPromise[index].notice_id,
                "notice_subject" : noticeListPromise[index].notice_subject,
                "notice_date" : noticeListPromise[index].notice_date

            }

            obj.push(objTemp);

            if(index == noticeListPromise.length -1){
                resolve(obj);
            }

        })


    })
}