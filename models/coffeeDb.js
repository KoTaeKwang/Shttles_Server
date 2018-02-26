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
    var test= true;
    if(test){
        var obj = [
            {
            "coffee_id": 1,
            "name": "아메리카노",
            "picture_url": "https://s3.ap-northeast-2.amazonaws.com/shuttles/coffee/jimin.png",
            "picture_version": "V1",
            "description": null,
            "price": 3500,
            "state": "coffee"
            },
            {
            "coffee_id": 2,
            "name": "라떼",
            "picture_url": "https://s3.ap-northeast-2.amazonaws.com/shuttles/coffee/jimin.png",
            "picture_version": "V1",
            "description": null,
            "price": 4000,
            "state": "lattee"
            }
            ]
         callback(obj);   
         return; 
    }
    


    async.waterfall([
        function(callback){
            var coffeeListSql = "Select coffee_id,name,picture_url,description,picture_version from coffee"
            pool.getConnection(function(err,connection){
                connection.query(coffeeListSql,function(err,coffeeList){
                    callback(null,coffeeList);
                })
            })

        },function(coffeeList,callback){
            var coffeePriceListSql = "Select price from coffee_size where coffee_id = ?"
            var objPriceList = [];
            pool.getConnection(function(err,connection){
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
    
    var test= true;
    if(test){
        var obj = [
            {
            "option_id": 1,
            "option_name": "과메기추가",
            "option_price": 500
            },
            {
            "option_id": 2,
            "option_name": "ice",
            "option_price": 500
            },
            {
            "option_id": 3,
            "option_name": "hot",
            "option_price": 500
            }
            ]
         callback(obj);  
         return; 
    }
    
    
    
    var obj = [];
    async.waterfall([
        function(callback){
            var coffeeOptionListSql = "Select option_id,name,price from coffee_option where coffee_id = ?"
            pool.getConnection(function(err,connection){
               
                connection.query(coffeeOptionListSql,coffee_id,function(err,coffeeOptionList){
                    if(coffeeOptionList.length==0) callback(null,obj);

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
 
    var test= true;
    if(test){
        var obj = [
            {
            "coffee_id": 1,
            "name": "아메리카노",
            "price": 3000,
            "picture_url": "https://s3.ap-northeast-2.amazonaws.com/shuttles/coffee/jimin.png",
            "version": "V1",
            "description": null
            }
            ]
         callback(obj);   
         return; 
    }
 
 
    var obj =[];
  async.waterfall([
    function(callback){
        pool.getConnection(function(err,connection){
            var coffeeTodayMenuSql = "SELECT t.coffee_id, t.price, c.name,c.picture_url,c.picture_version,c.description from todayDrinkMenu AS t JOIN coffee AS c ON t.coffee_id = c.coffee_id";
            
            connection.query(coffeeTodayMenuSql,function(err,coffeeTodayMenu){
                callback(null,coffeeTodayMenu);
            })
        })
    },function(coffeeTodayMenu,callback){
        if(coffeeTodayMenu.length==0) callback(null,obj)
   
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
    
    var test= true;
    if(test){
        var obj = [
            {
            "coffee_id": 2,
            "name": "라떼",
            "price": 4000,
            "picture_url": "https://s3.ap-northeast-2.amazonaws.com/shuttles/coffee/jimin.png",
            "version": "V1",
            "description": null
            }
            ]
         callback(obj);   
         return; 
    }
    
    var obj =[];
    async.waterfall([
      function(callback){
          pool.getConnection(function(err,connection){
              var coffeeCombiMenuSql = "SELECT t.coffee_id, t.price, c.name,c.picture_url,c.picture_version,c.description from combiDrinkMenu AS t JOIN coffee AS c ON t.coffee_id = c.coffee_id";
              
              connection.query(coffeeCombiMenuSql,function(err,coffeeCombiMenu){
                  callback(null,coffeeCombiMenu);
              })
          })
      },function(coffeeCombiMenu,callback){
          if(coffeeCombiMenu.length==0) callback(null,obj);
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
    
    var test= true;
    if(test){
        var obj = [
            {
            "coffee_id": 2,
            "name": "라떼",
            "picture_url": "https://s3.ap-northeast-2.amazonaws.com/shuttles/coffee/jimin.png",
            "version": "V1",
            "description": null
            },
            {
            "coffee_id": 1,
            "name": "아메리카노",
            "picture_url": "https://s3.ap-northeast-2.amazonaws.com/shuttles/coffee/jimin.png",
            "version": "V1",
            "description": null
            }
            ]
         callback(obj);   
         return; 
    }
    
    
    console.log("user_id : ",user_id)
   var obj =[];
    async.waterfall([
        function(callback){
            pool.getConnection(function(err,connection){
                var myMenuSql = "Select coffee_id from myDrinkMenu where user_id = ?";

                connection.query(myMenuSql,user_id,function(err,myMenu){
                    callback(null,myMenu);
                })
            })
        },function(myMenu,callback){

            if(myMenu.length==0) callback(null,obj);

            pool.getConnection(function(err,connection){
                var coffeeListSql = "Select coffee_id, name, picture_url, picture_version, description from coffee where coffee_id = ?";
                
                forEach(myMenu,function(item,index,arr){

                    connection.query(coffeeListSql,myMenu[index].coffee_id,function(err,coffeeList){
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
