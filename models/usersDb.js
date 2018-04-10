var mysql = require('mysql');
var forEach = require('async-foreach').forEach;
var async = require('async');
var HashMap = require('hashmap');
var logger = require('../winston');

var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'shuttlesDB'
});

exports.userAdd = function(data,callback){
    console.log("user_id : ",data.user_id);
    var user_id = data.user_id;
    var obj = [];

    pool.getConnection(function(err,connection){
        if(err){logger.log('error','connection error'+err); return callback(err,obj)};

        var getTypeUser = "Select type from user where user_id = ?"

        connection.query(getTypeUser,user_id,function(err,getUser){
            if(err){logger.log('error','connection error'+err); connection.release(); return callback(err,obj);};

            logger.log('debug','query '+getTypeUser+'['+user_id+']');
            
            if(typeof getUser[0] != "undefined"){
            if(getUser[0].type == 0){
            
                obj={"result" : "customer"};
            }else{
                obj={"result" : "owner"};
            }
            logger.log('debug','/user response : %j',obj);
            connection.release();
            return callback(null,obj);          
            }
            else{
                var addUserSql = "insert into user(user_id) values( ? )";
                connection.query(addUserSql,user_id,function(err,addUser)
                {
                    if(err){logger.log('error','connection error'+err); connection.release(); return callback(err,obj);};

                    logger.log('debug','query '+addUserSql+'['+user_id+']');
                    connection.release();
                    console.log("inserted user : ",user_id);
                    obj ={"result" : "customer"};
                    logger.log('debug','/user response : %j'+obj);
                    return callback(null,obj);
                })

            }

        })

      
    })
}

