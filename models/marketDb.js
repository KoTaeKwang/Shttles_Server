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


exports.getMarketList = function(data,callback){
    var marketListSql = "Select market_name from market"
    var obj =[];
    async.waterfall([
        function(callback){
            pool.getConnection(function(err,connection){
                if(err) throw err;
                
                connection.query(marketListSql,function(err,marketList){
                    callback(null,marketList);
                })
            })    
        },
        function(marketList,callback){
            if(marketList.length==0) callback(null,obj);

            forEach(marketList,function(item,index,arr){
                var objTemp = {
                    "name" : marketList[index].market_name
                }
                obj.push(objTemp);

                if(index == marketList.length-1)
                    callback(null,obj);
            })
        }
    ],function(err,results){
        callback(results);
    })
}


exports.getMarketTodayMenu = function(market_name,callback){
    var obj =[];
    async.waterfall([
        function(callback){
            pool.getConnection(function(err,connection){
                var marketTodayMenuSql = "Select t.food_id, t.price, f.name, f.picture_url,f.picture_version,f.description from todayMarketMenu AS t Join food AS f ON t.food_id = f.food_id t.where market_name = ?"
                connection.query(marketTodayMenuSql,market_name,function(err,marketTodayMenu){
                    callback(null,marketTodayMenu);
                })
            })
        },function(marketTodayMenu,callback){
            if(marketTodayMenu.length==0) callback(null,obj);

            forEach(marketTodayMenu,function(item,index,arr){
                var objTemp ={
                    "food_id" : marketTodayMenu[index].food_id,
                    "name" : marketTodayMenu[index].name,
                    "price" : marketTodayMenu[index].price,
                    "picture_url" : marketTodayMenu[index].picture_url,
                    "picture_version" : marketTodayMenu[index].picture_version,
                    "description" : marketTodayMenu[index].description
                }

                obj.push(objTemp);

                if(index==marketTodayMenu.length-1)
                    callback(null,obj);
            })
        }
    ],function(err,results){
        callback(results);
    })
}

exports.getMarketCombiMenu = function(market_name,callback){
    var obj =[];
    async.waterfall([
        function(callback){
            pool.getConnection(function(err,connection){
                var marketCombiMenuSql = "Select t.food_id, t.price, f.name, f.picture_url,f.picture_version,f.description from combiMarketMenu AS t Join food AS f ON t.food_id = f.food_id t.where market_name = ?"
                connection.query(marketCombiMenuSql,market_name,function(err,marketCombiMenu){
                    callback(null,marketCombiMenu);
                })
            })
        },function(marketCombiMenu,callback){
           
            if(marketCombiMenu.length==0) callback(null,obj);

            forEach(marketCombiMenu,function(item,index,arr){
                var objTemp ={
                    "food_id" : marketCombiMenu[index].food_id,
                    "name" : marketCombiMenu[index].name,
                    "price" : marketCombiMenu[index].price,
                    "picture_url" : marketCombiMenu[index].picture_url,
                    "picture_version" : marketCombiMenu[index].picture_version,
                    "description" : marketCombiMenu[index].description
                }

                obj.push(objTemp);
                
                if(index==marketCombiMenu.length-1)
                    callback(null,obj);
            })
        }
    ],function(err,results){
        callback(results);
    })
}

exports.getMarketMyMenu = function(data,callback){
    var market_name = data.market_name;
    var user_id = data.user_id;
    var obj =[];
    async.waterfall([
        function(callback){
            pool.getConnection(function(err,connection){
                var markeMyMenuSql = "Select t.food_id, f.price, f.name, f.picture_url,f.picture_version,f.description from myMarketMenu AS t Join food AS f ON t.food_id = f.food_id t.where market_name = ? and user_id = ?"
                connection.query(markeMyMenuSql,[market_name,user_id],function(err,markeMyMenu){
                    callback(null,markeMyMenu);
                })
            })
        },function(markeMyMenu,callback){
            if(markeMyMenu.length ==0 ) callback(null,obj);
            forEach(markeMyMenu,function(item,index,arr){
                var objTemp ={
                    "food_id" : markeMyMenu[index].food_id,
                    "name" : markeMyMenu[index].name,
                    "price" : markeMyMenu[index].price,
                    "picture_url" : markeMyMenu[index].picture_url,
                    "picture_version" : markeMyMenu[index].picture_version,
                    "description" : markeMyMenu[index].description
                }

                obj.push(objTemp);
                
                if(index==markeMyMenu.length-1)
                    callback(null,obj);
            })
        }
    ],function(err,results){
        callback(results);
    })
}


