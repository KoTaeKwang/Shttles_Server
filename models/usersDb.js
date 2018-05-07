var forEach = require('async-foreach').forEach;
var async = require('async');
var HashMap = require('hashmap');
var logger = require('../winston');
var pool = require('../mysql');

async function getConnection(){
    return new Promise(function (resolve,reject) {

        pool.getConnection(function (err,connection) {

            if(err){
                logger.log('error', 'connection error' + err);
                connection.release();
                reject(err);
            }

            resolve(connection);

        })

    })
}

async function getUserType(user_id,connection){

    return new Promise(function (resolve,reject) {

        var getTypeUser = "Select type,pushId from user where user_id = ?"


        connection.query(getTypeUser, user_id, function (err, getUser) {
            if (err) {
                logger.log('error', 'connection error' + err);
                connection.release();
                return reject(err);
            };
            console.log("getUser : ",getUser);
            resolve(getUser);
        });

    })

}

async function updateUser(getUser,user_id,pushId,connection){

    return new Promise(function (resolve, reject) {
        var obj = [];

        if (pushId != getUser[0].pushId) {
            var updatePushId = "update user set pushId = ? where user_id = ?"

            connection.query(updatePushId,[pushId,user_id],function(err,result){
                if(err){ logger.log('error', 'update error [' +user_id+','+pushId+']'+ err); connection.release(); return reject(err); }

                if (getUser[0].type == 0) {
                    obj = { "result": "customer" };
                } else {
                    obj = { "result": "owner" };
                }

                logger.log('debug', '/user response : %j', obj);
                connection.release();
                resolve(obj);
            })
        }else{

            if (getUser[0].type == 0) {
                obj = { "result": "customer" };
            } else {
                obj = { "result": "owner" };
            }

            logger.log('debug', '/user response : %j', obj);
            connection.release();
            resolve( obj);

        }


    })

}

async function insertUser(user_id,pushId,connection){

    return new Promise(function (resolve,reject) {

        var obj =[];
        var addUserSql = "insert into user(user_id,pushId, type) values( ?,? ,0)";
        connection.query(addUserSql, [user_id, pushId], function (err, addUser) {
            if (err) {
                logger.log('error', 'connection error ' + err);
                connection.release();
                return reject(err);
            };

            logger.log('debug', 'query ' + addUserSql + '[' + user_id + ']');
            connection.release();
            console.log("inserted user : ", user_id);
            obj = {"result": "customer"};
            logger.log('debug', '/user response : %j' + obj);
            return resolve(obj);
        })
    })

}


exports.userAdd = async function (data,callback){


    var user_id = data.user_id;
    var pushId = data.pushId;

    console.log("user_id : ",user_id,",  pushId : ",pushId)

    try{
        const getConnectionPromise = await getConnection();
        const getUserTypePromise = await getUserType(user_id,getConnectionPromise);

        if(typeof getUserTypePromise[0] != "undefined"){
            const updateUserPromise = await updateUser(getUserTypePromise,user_id,pushId,getConnectionPromise);
            callback(null,updateUserPromise)
        }else{
            const insertUserPromise = await insertUser(user_id,pushId,getConnectionPromise);
            callback(null,insertUserPromise)
        }

    }catch (e) {
        callback(e,null);
    }

}
