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

exports.getOrderList = function(user_id,callback){

    console.log('userid : ',user_id);

    async.waterfall([
        function(callback){
            pool.getConnection(function(err,connection){
                var coffeeListSql ="select o.order_id, o.state, o.price,o.user_id, c.count,coffee.name from orders AS o JOIN coffee_orders AS c ON o.order_id = c.order_id JOIN coffee on coffee.coffee_id = c.coffee_id where o.user_id = ?  order by o.date DESC"
                
                connection.query(coffeeListSql,user_id,function(err,coffeeList){
                    console.log("coffeeList : ",coffeeList);
                    callback(null,coffeeList);              
                })
              });
        },
        function(coffeeList,callback){
             var obj = [];
             var standard = -1;
             var coffeeTemp=[];
            
             if(coffeeList.length==0){
                 var obj ={"result":"empty"};
                 callback(null,obj);
                 return;
             }

            forEach(coffeeList,function(item,index,arr){
                console.log('index : ',index, "  coffeeList.length : ",coffeeList.length);
                console.log('standard : ',standard, "  order_id : ",coffeeList[index].order_id);
                if(standard!=coffeeList[index].order_id){ //다를 때 초기화
                        if(index>0){
                            var resultTemp ={"order_id" : coffeeList[index-1].order_id,
                                            "order_price" : coffeeList[index-1].price,
                                            "order_state" : coffeeList[index-1].state,
                                            "food":[],
                                            "coffee": coffeeTemp };

                            obj.push(resultTemp);
                            console.log("index : ",index,"  coffeeTemp : ",coffeeTemp);  
                        }
                        coffeeTemp=[];
                }

                standard=coffeeList[index].order_id;
                var resultCoffeeTemp = {"name" : coffeeList[index].name, "count" : coffeeList[index].count};
                coffeeTemp.push(resultCoffeeTemp);

                if(index==coffeeList.length-1){
                    var resultTemp ={"order_id" : coffeeList[index].order_id,
                    "order_price" : coffeeList[index].price,
                    "order_state" : coffeeList[index].state,
                    "food":[],
                    "coffee": coffeeTemp };
                    obj.push(resultTemp);
                    console.log("index : ",index,"  coffeeTemp : ",coffeeTemp);  
                    callback(null,obj);
                }
                    
            });
        }
    ],function(err,results){
        callback(results);
    })

};



exports.getOrderDetail = function(order_id,callback){
    pool.getConnection(function(err,connection){
        var optionDetailSql = "select o.order_id, o.address,o.state, o.price as orderPrice, o.user_id, o.date, c.count,coffee.name, coffee_option.name as optionName,c.price as coffeePrice from orders AS o JOIN coffee_orders AS c ON o.order_id = c.order_id JOIN coffeeoption_orders AS co on co.coffee_ordersId = c.coffee_ordersId JOIN coffee on coffee.coffee_id = c.coffee_id JOIN coffee_option on coffee_option.option_id = co.option_id where o.order_id = ?";
        var obj = [];
        var coffeename = "";
        var coffeeOptionArr = [];
        var coffee=[];
        async.waterfall([
            function(callback){
                pool.getConnection(function(err,connection){
                    connection.query(optionDetailSql,order_id,function(err,optionDetail){
                        console.log("optionDetail : ",optionDetail);
                        callback(null,optionDetail);
                    })
                })
            },

            function(optionDetail,callback){
               
                forEach(optionDetail,function(item,index,arr){
                    
                    if(coffeename != optionDetail[index].name){
                        if(index>0){
                            var coffeeTemp = {
                                "name" : optionDetail[index-1].name,
                                "count" : optionDetail[index-1].count,
                                "price" : optionDetail[index-1].price,
                                "option" : coffeeOptionArr    
                            }
                            coffee.push(coffeeTemp);
                            coffeeOptionArr=[];
                        }

                    } 
                    console.log("index: ",index," coffeename : ",optionDetail[index].name, "  optionName : ",optionDetail[index].optionName);
                    coffeename = optionDetail[index].name;
                    var optionTemp = {"name" : optionDetail[index].optionName}
                    coffeeOptionArr.push(optionTemp);
                    

                    if(index==optionDetail.length-1){
                        var coffeeTemp = {
                            "name" : optionDetail[index-1].name,
                            "count" : optionDetail[index-1].count,
                            "price" : optionDetail[index-1].price,
                            "option" : coffeeOptionArr    
                        }
                        coffee.push(coffeeTemp);

                        var objTemp = {
                            "order_id" : optionDetail[index].order_id,
                            "order_date" : optionDetail[index].date,
                            "order_state" : optionDetail[index].state,
                            "order_price" : optionDetail[index].orderPrice,
                            "order_address" : optionDetail[index].address,
                            "coffee" : coffee,
                            "food" : []
                        }
                        callback(null,objTemp);
                    }

               })   

            }
        ],function(err,results){
            callback(results);
        })
    
    });
};


exports.insertOrder = function (data, callback) {
    console.log("data : " ,data);
    var user_id  = data.user_id;
    var order_address =data.order_address
    var order_totalPrice = data.order_totalPrice
    var coffee= data.coffee;
    var food = data.food;
    var order_id;
    var coffee_ordersId;
    var food_ordersId;
    console.log("userId :" , data.user_id);
    console.log("address : ",data.order_address);
    console.log("totalPrice : ",data.order_totalPrice);
    console.log("Coffee : ",data.coffee);
    console.log("food : " ,data.food)
    

    pool.getConnection(function(err,connection){
        if(err) throw err; 

        async.waterfall([
            function(callback){
                
                connection.beginTransaction(function(err){ //orders insert
                    if(err) throw err;
        
                    var addOrdersSql = "insert into orders(state,address,price,user_id) values(?,?,?,?)";
                
                    var orders = [
                     0, order_address, order_totalPrice,user_id
                    ]
        
                    console.log("orders : ",orders);
        
                    var query = connection.query(addOrdersSql,orders,function(err,results){
                       console.log(query.sql);
                        if(err){return connection.rollback(function(){
                            throw err;
                        })
                    }
                    order_id = results.insertId;
                    callback(null,connection);
                })                 
            })

            },function(connection,callback){ //coffeeorders insert
                   
                forEach(coffee,function(item,index,arr){
                    var insertCoffeeOrdersSql = "insert into coffee_orders(count,coffee_id,order_id,price) values(?,?,?,?)";
                    
                    var coffee_orders = [
                        coffee[index].count, coffee[index].coffee_id, order_id , coffee[index].price
                    ]

                    console.log("coffee_orders " , coffee_orders);
                    
                    var query = connection.query(insertCoffeeOrdersSql,coffee_orders,function(err,results){
                        console.log(query.sql);
                        if(err){return connection.rollback(function(){
                            throw err;
                        })
                     } 
                   
                     coffee_ordersId = results.insertId;

                     if(typeof coffee[index].option == "undefined"){
                         console.log("coffee is undefined");
                     }
                    else{
                     forEach(coffee[index].option,function(item,optionIndex,arr){
                        var insertCoffeeOptionSql = "insert into coffeeOption_orders(coffee_ordersId,option_id) values(?,?)";

                        var coffee_options = [coffee_ordersId,coffee[index].option[optionIndex].option_id];

                        var query = connection.query(insertCoffeeOptionSql,coffee_options,function(err,results){
                            console.log(query.sql);
                            if(err){return connection.rollback(function(){
                                throw err;
                            })
                         } 

                        })
                    })

                }

                })
            
                    if(coffee.length-1 == index)
                        callback(null,connection);
                })
            },function(connection,callback){// foodorders insert
                if(typeof food == "undefined"){ console.log("food is undefined"); callback(null,connection);}
                else{
                forEach(food,function(item,index,arr){
                    var insertFoodOrdersSql = "insert into food_orders(count,food_id,order_id,price) values(?,?,?,?)";
                    
                    var food_orders = [
                        food[index].count, food[index].food_id, order_id , food[index].price
                    ]

                    console.log("food_orders " , food_orders);
                    
                    var query = connection.query(insertFoodOrdersSql,food_orders,function(err,results){
                        console.log(query.sql);
                        if(err){return connection.rollback(function(){
                            throw err;
                        })
                     } 
                  
                     food_ordersId = results.insertId;


                     forEach(food[index].option,function(item,optionIndex,arr){
                        var insertFoodOptionSql = "insert into foodOption_orders(food_ordersId,option_id) values(?,?)";

                        var food_options = [food_ordersId,food[index].option[optionIndex].option_id];

                        var query = connection.query(insertFoodOptionSql,food_options,function(err,results){
                            console.log(query.sql);
                            if(err){return connection.rollback(function(){
                                throw err;
                            })
                         } 

                        })
                    })

                })
            
                    if(food.length-1 == index)
                        callback(null,connection);
                })
            }
        }
        ],function(err,connection){
            connection.commit(function(err){
              if(err)
                return connection.rollback(function(){
                    throw err;
                })  
            });

            var obj =[{"result" : "success"}];
            callback(obj);

        }) 
    })
}
