var mysql = require('mysql');
var forEach = require('async-foreach').forEach;
var async = require('async');
var HashMap = require('hashmap');

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
    var obj ;

    pool.getConnection(function(err,connection){
        if(err) throw err;

        var getTypeUser = "Select type from user where user_id = ?"

        connection.query(getTypeUser,user_id,function(err,getUser){
            
            if(typeof getUser[0] != "undefined"){

            if(getUser[0].type == 0){
                obj={"result" : "customer"};
            }else{
                obj={"result" : "owner"};
            }
            callback(obj);    
            return;        
            }
            else{

                var addUserSql = "insert into user(user_id) values( ? )";
                connection.query(addUserSql,user_id,function(err,addUser)
                {
                    console.log("inserted user : ",user_id);
                    obj ={"result" : "customer"};
                    callback(obj);
                })

            }

        })

      
    })
}

