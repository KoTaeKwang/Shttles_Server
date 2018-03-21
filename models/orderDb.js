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
    var user_id  = "naver.com"
    var order_address = "여기다"
    var order_totalPrice = "3000"
    var coffee =[
        {
            "name" : "아메리카노",
            "count" : 2,
            "price" : 3000,
            "option" : [{"name" : "샷추가"},{"name" : "차갑게"}]
        },
        {
            "name" : "라떼",
            "count" : 2,
            "price" : 3000,
            "option" : [{"name" : "샷추가"},{"name" : "차갑게"}]
        }

    ]
    console.log(data.user_id);
    console.log(data.order_address);
    console.log(data.order_totalPrice);
    console.log(data.coffee);
    

    // order 먼저  address userId 넣고
    // coffee_orders 에  count, coffee_id ,order_id,price
    //coffeeOption_orders 에 추가 



    var obj =[{"success" : "ok"}];
    callback(obj);
}

