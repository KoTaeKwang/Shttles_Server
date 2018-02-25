var mysql = require('mysql');
var forEach = require('async-foreach').forEach;
var async = require('async');
var HashMap = require('hashmap');

var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'shuttlesdb'
});



exports.getFoodList = function(market_name,callback){
    console.log("market_name : ",market_name);
    var obj = [];
    var foodListSql = "Select food_id,name,price,picture_url,description from food where market_name = ?";
    async.waterfall([
        function(callback){
            pool.getConnection(function(err,connection){
                if(err) throw err;

                connection.query(foodListSql,market_name,function(err,foodList){
                    callback(null,foodList)
                })
            })
        },function(foodList,callback){

            if(foodList.length==0) callback(null,obj);

            forEach(foodList,function(item,index,arr){
                var objTemp = {
                    "food_id" : foodList[index].food_id,
                    "name" : foodList[index].name,
                    "price" : foodList[index].price,
                    "picture_url" : foodList[index].picture_url,
                    "picture_version" : foodList[index].picture_version,
                    "description" : foodList[index].description
                }

                obj.push(objTemp);

                if(index== foodList.length-1)
                    callback(null,obj);
            })
        }
    ],function(err,results){
        callback(results);
    })
}

exports.getFoodOption = function(food_id,callback){
    console.log("food_id : ",food_id);
    var obj = [];
    var foodOptionSql = "Select option_id,name,price from food_option where food_id = ?"

    async.waterfall([
        function(callback){
            pool.getConnection(function(err,connection){
                if(err) throw err;
                connection.query(foodOptionSql,food_id,function(foodOption){
                    callback(null,foodOption);
                })

            })
        },function(foodOption,callback){
            if(foodOption.length==0) callback(null,obj);
            forEach(foodOption,function(item,index,arr){
                var objTemp = {
                    "option_id" : foodOption[index].option_id,
                    "option_name" : foodOption[index].option_name,
                    "option_price" : foodOption[index].price
                }
                obj.push(objTemp);

                if(index == foodOption.length-1)
                    callback(null,obj);
            })
        }
    ],function(err,results){
        callback(results);
    })
}

