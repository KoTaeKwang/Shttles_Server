var mysql = require('mysql');
var forEach = require('async-foreach').forEach;
var async = require('async');
var HashMap = require('hashmap');
var logger = require('../winston');

var pool = mysql.createPool({
    connectionLimit: 20,
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'shuttlesDB'
});

var emptyResult = [{"result":"empty"}]

exports.test = function (data, callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.error('not connected');
        }
        console.log('connected!!');
        callback(data);
    })
};


exports.getCoffee = function (data, callback) {
    var obj = [];
    async.waterfall([
        function(callback){
            var coffeeListSql = "Select coffee_id,name,picture_url,description,picture_version from coffee"
            pool.getConnection(function(err,connection){
                if(err){return callback(err,obj)};

                connection.query(coffeeListSql,function(err,coffeeList){
                    connection.release();
                    if(err){return callback(err,obj)};

                    logger.log('debug','query '+coffeeListSql);
                    callback(null,coffeeList);
                })
            })

        },function(coffeeList,callback){
            var coffeePriceListSql = "Select price from coffee_size where coffee_id = ?"
            var objPriceList = [];
            pool.getConnection(function(err,connection){
                connection.release();
                if(err){return callback(err,obj)};
             
                logger.log('debug','query '+coffeePriceListSql);
                forEach(coffeeList,function(item,index,arr){
                
                    var coffee_id = coffeeList[index].coffee_id;
                    connection.query(coffeePriceListSql,coffee_id,function(err,coffeePriceList){
                        var objPriceListTemp = {"price" : coffeePriceList[0].price}
                        objPriceList.push(objPriceListTemp);
                        
                        if(index==coffeeList.length-1)
                        callback(null,coffeeList,objPriceList);
                
                    })
                })
            })

        },function(coffeeList,objPriceList,callback){
            var coffeeStateListSql = "Select name from coffee_state where coffee_id = ?"
            var objStateList = [];

            pool.getConnection(function(err,connection){
                connection.release();
                if(err){return callback(err,obj)};
               
                logger.log('debug','query '+coffeeStateListSql);
                forEach(coffeeList,function(item,index,arr){
                
                    var coffee_id = coffeeList[index].coffee_id;
                    connection.query(coffeeStateListSql,coffee_id,function(err,coffeeStateList){
                        var objStateListTemp = {"name" : coffeeStateList[0].name}
                        objStateList.push(objStateListTemp);
                        
                        if(index==coffeeList.length-1)
                        callback(null,coffeeList,objPriceList,objStateList);
                    })
                })
            })

        },function(coffeeList,objPriceList,objStateList,callback){
            var obj = [];

            forEach(coffeeList,function(item,index,arr){
                
                var objTemp = {
                    "coffee_id" : coffeeList[index].coffee_id,
                    "name" : coffeeList[index].name,
                    "picture_url" : coffeeList[index].picture_url,
                    "picture_version" : coffeeList[index].picture_version,
                    "description" : coffeeList[index].description,
                    "price" : objPriceList[index].price,
                    "state" : objStateList[index].name
                }

                obj.push(objTemp);

             
                if(index==coffeeList.length-1)
                    callback(null,obj);
            })

        }
    ],function(err,results){
        callback(results);
    })

};


exports.getCoffeeDetail = function (coffee_id, callback) {

    var obj = [];
    async.waterfall([
        function(callback){
            var coffeeOptionListSql = "Select option_id,name,price from coffee_option where coffee_id = ?"
            pool.getConnection(function(err,connection){
               if(err){return callback(err,obj)};
                connection.query(coffeeOptionListSql,coffee_id,function(err,coffeeOptionList){
                    if(err){return callback(err,obj)};

                    connection.release();
                    logger.log('debug','query '+coffeeOptionListSql+'['+coffee_id+']');
                    if(coffeeOptionList.length==0) return callback(null,emptyResult);
                   
                    forEach(coffeeOptionList,function(item,index,arr){
                        var objTemp = {
                            "option_id" : coffeeOptionList[index].option_id,
                            "option_name" : coffeeOptionList[index].name,
                            "option_price" : coffeeOptionList[index].price,
                        }
                        obj.push(objTemp);

                        if(index == coffeeOptionList.length-1)
                            callback(null,obj);
                        
                    })
                })                
            })
        }
    ],function(err,results){
        callback(results);
    })
};


exports.getCoffeeTodayMenu = function(data,callback){

    var obj =[];
  async.waterfall([
    function(callback){
        pool.getConnection(function(err,connection){
            var coffeeTodayMenuSql = "SELECT t.coffee_id, t.price, c.name,c.picture_url,c.picture_version,c.description from todayDrinkMenu AS t JOIN coffee AS c ON t.coffee_id = c.coffee_id";
            
            connection.query(coffeeTodayMenuSql,function(err,coffeeTodayMenu){
                connection.release();
                if(err){return callback(err,obj)};

                logger.log('debug','query '+coffeeTodayMenuSql);
                callback(null,coffeeTodayMenu);
            })
        })
    },function(coffeeTodayMenu,callback){
        if(coffeeTodayMenu.length==0) return callback(null,emptyResult)
   
        forEach(coffeeTodayMenu,function(item,index,arr){
            var objTemp = {
                "coffee_id" : coffeeTodayMenu[index].coffee_id,
                "name" : coffeeTodayMenu[index].name,
                "price" : coffeeTodayMenu[index].price,
                "picture_url" : coffeeTodayMenu[index].picture_url,
                "version" : coffeeTodayMenu[index].picture_version,
                "description" : coffeeTodayMenu[index].description
            }
            obj.push(objTemp);

            if(index== coffeeTodayMenu.length-1)
                callback(null,obj);
        })
    }
  ],function(err,results){
    callback(results);
  })
};

exports.getCoffeeCombiMenu = function(data,callback){
    
    var obj =[];
    async.waterfall([
      function(callback){
          pool.getConnection(function(err,connection){
              var coffeeCombiMenuSql = "SELECT t.coffee_id, t.price, c.name,c.picture_url,c.picture_version,c.description from combiDrinkMenu AS t JOIN coffee AS c ON t.coffee_id = c.coffee_id";
              
              connection.query(coffeeCombiMenuSql,function(err,coffeeCombiMenu){
                logger.log('debug','query '+coffeeCombiMenuSql);
                connection.release();
                if(err){return callback(err,obj)};
                callback(null,coffeeCombiMenu);
              })
          })
      },function(coffeeCombiMenu,callback){
          if(coffeeCombiMenu.length==0) return callback(null,emptyResult);
          forEach(coffeeCombiMenu,function(item,index,arr){
              var objTemp = {
                  "coffee_id" : coffeeCombiMenu[index].coffee_id,
                  "name" : coffeeCombiMenu[index].name,
                  "price" : coffeeCombiMenu[index].price,
                  "picture_url" : coffeeCombiMenu[index].picture_url,
                  "version" : coffeeCombiMenu[index].picture_version,
                  "description" : coffeeCombiMenu[index].description
              }
              obj.push(objTemp);
  
              if(index== coffeeCombiMenu.length-1)
                  callback(null,obj);
          })
      }
    ],function(err,results){
      callback(results);
    })

  };




exports.getCoffeeMyMenu = function(user_id,callback){
    

   var obj =[];
    async.waterfall([
        function(callback){
            pool.getConnection(function(err,connection){
                var myMenuSql = "Select coffee_id from myDrinkMenu where user_id = ?";

                connection.query(myMenuSql,user_id,function(err,myMenu){
                    connection.release();
                    if(err){return callback(err,obj)};
                    logger.log('debug','query '+myMenuSql+'['+user_id+']');
                    callback(null,myMenu);
                })
            })
        },function(myMenu,callback){

            if(myMenu.length==0) return callback(null,emptyResult);

            pool.getConnection(function(err,connection){
                if(err){return callback(err,obj)};
                var coffeeListSql = "Select coffee_id, name, picture_url, picture_version, description from coffee where coffee_id = ?";
                logger.log('debug','query '+coffeeListSql);
                forEach(myMenu,function(item,index,arr){

                    connection.query(coffeeListSql,myMenu[index].coffee_id,function(err,coffeeList){
                        connection.release();
                        if(err){return callback(err,obj)};
                        console.log("coffeeList : ",coffeeList);
                      
                        var objTemp = {
                                "coffee_id" : coffeeList[0].coffee_id,
                                "name" : coffeeList[0].name,
                                "picture_url" : coffeeList[0].picture_url,
                                "version" : coffeeList[0].picture_version,
                                "description" : coffeeList[0].description
                        }
                      
                        obj.push(objTemp);

                     if(index==myMenu.length-1)
                        callback(null,obj);   
                    })
                })
            })
        }
    ],function(err,results){
        callback(results);
    })
};


exports.insertCoffee = function(data,callback){
    var name = data.name;
    console.log("name : ",name);
    pool.getConnection(function(err,connection){
        if(err) throw err;

        var addCoffeeSql = "insert into coffee(name) values( ? )";
        connection.query(addCoffeeSql,name,function(err,addUser){
            connection.release();

            if(err) throw err;
            console.log("inserted coffee: ",name);
            var obj ={"success" : "ok"};
            callback(obj);
        })
    })

}