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

exports.insertFood = function(data,callback){
    var name = data.name;
    var price = data.price;
    var market_name = data.market_name;

    console.log("name : ",name);
    pool.getConnection(function(err,connection){
        if(err) throw err;

        var addFoodSql = "insert into food(name,price,market_name) values( ?,?,? )";
        connection.query(addFoodSql,[name,price,market_name],function(err,addUser){
            connection.release();

            if(err) throw err;
            console.log("inserted food: ",name);
            var obj ={"success" : "ok"};
            callback(obj);
        })
    })

}


exports.getFoodList = function(market_name,callback){
  
    var test= true;
    if(test){
        var obj = [
            {
            "food_id": 3,
            "name": "불고기버거",
            "price": 3000,
            "picture_url": "https://s3.ap-northeast-2.amazonaws.com/shuttles/coffee/jimin.png",
            "description": null
            },
            {
            "food_id": 4,
            "name": "새우버거",
            "price": 3000,
            "picture_url": "https://s3.ap-northeast-2.amazonaws.com/shuttles/coffee/jimin.png",
            "description": null
            }
            ]
         callback(obj);  
         return;  
    }
  
  
  
  
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

            if(foodList == null | foodList.length==0) callback(null,obj);

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
   
    var test= true;
    if(test){
        var obj = [
            {
            "option_id": 1,
            "option_name": "콜라",
            "option_price": 200
            },
            {
            "option_id": 2,
            "option_name": "사이다",
            "option_price": 300
            }
            ]
         callback(obj); 
         return;   
    }
  
   
    console.log("food_id : ",food_id);
    var obj = [];
    var foodOptionSql = "Select option_id,name,price from food_option where food_id = ?"

    async.waterfall([
        function(callback){
            pool.getConnection(function(err,connection){
                if(err) throw err;
                connection.query(foodOptionSql,food_id,function(err,foodOption){
                    callback(null,foodOption);
                })

            })
        },function(foodOption,callback){
            if(foodOption.length==0) callback(null,obj);
            forEach(foodOption,function(item,index,arr){
                var objTemp = {
                    "option_id" : foodOption[index].option_id,
                    "option_name" : foodOption[index].name,
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
