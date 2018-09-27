
var forEach = require('async-foreach').forEach;
var async = require('async');
var HashMap = require('hashmap');
var logger = require('../winston');
var fcm = require('../fcm');
var pool = require('../mysql');

var emptyResult = [{"result":"empty"}]
var order_id;



exports.getOrderList = async function(user_id,callback){
    var obj =[];


    try{
        const getPoolConnectionPromise = await getPoolConnection();
        const getOrdersPromise = await getOrders(user_id,getPoolConnectionPromise);
        if(getOrdersPromise.length ==0){
            return callback(null,emptyResult)
        }

        forEach(getOrdersPromise,async function(item,index,arr){
            const coffeeList = await getCoffeeListByOrderId(getOrdersPromise[index].order_id,getPoolConnectionPromise);
            const foodList = await getFoodListByOrderId(getOrdersPromise[index].order_id,getPoolConnectionPromise);
            const makeResponseOrderListPromise = await makeResponseOrderList(getOrdersPromise[index],coffeeList,foodList);
            console.log("Response : ",makeResponseOrderListPromise);

            obj.push(makeResponseOrderListPromise);

            if(getOrdersPromise.length -1 == index){
                await releaseConnection(getPoolConnectionPromise);
                logger.log('debug','order List : %j',obj);
                callback(null,obj);
            }
        });

    }catch (e) {
        callback(e,null);
    }

}


exports.getOrderDetail = async function(order_id,callback){

    try{
        const getPoolConnectionPromise = await getPoolConnection();
        const getOrdersByOrderIdPromise = await getOrdersByOrderId(order_id,getPoolConnectionPromise);
        const coffeeList  = await getCoffeeListByOrderId(order_id,getPoolConnectionPromise);
        const foodList = await getFoodListByOrderId(order_id,getPoolConnectionPromise);
        const coffeeObj = await makeCoffeeListWithOption(coffeeList,getPoolConnectionPromise);
        const foodObj = await makeFoodListWithOption(foodList,getPoolConnectionPromise);
        const responseOrderDetail = await makeOrderDetailResponse(getOrdersByOrderIdPromise,coffeeObj,foodObj);
        logger.log('debug','orderDetail : %j',responseOrderDetail);
        await releaseConnection(getPoolConnectionPromise);
        callback(null,responseOrderDetail);
    }catch(e){
        callback(e,null);
    }

}


exports.insertOrder = async function (data, callback) {
    console.log("data : " ,data);

    var user_id  = data.user_id;
    var order_address =data.order_address;
    var order_price = data.order_price;
    var coffee= data.coffee;
    var food = data.food;
    var order_comment = data.order_comment;


    console.log("userId :" , user_id);
    console.log("address : ",order_address);
    console.log("price : ",order_price);
    console.log("content : ",order_comment);
    console.log("Coffee : ",coffee);
    console.log("food : " ,food);

    var obj = {
        "subject" : "주문 진행중입니다.",
        "type" : "order_complete"
    }

    logger.log('debug','/order request -> userId : '+user_id+', address : '+order_address+', price : '+order_price+', coffee : '+coffee+', food : '+food);

    try{
        const beginTransactionPromise = await beginTransaction();
        const insertOrderPromise = await insertOrder(data,beginTransactionPromise);
        const insertCoffeeOrderAndOptionPromise = await insertCoffeeOrderAndOption(coffee,insertOrderPromise);
        const insertFoodOrderAndOptionPromise = await insertFoodOrderAndOption(food,insertCoffeeOrderAndOptionPromise);
        const commitConnectionPromise = await commitConnection(insertFoodOrderAndOptionPromise);

        const getPoolConnectionPromise = await getPoolConnection();
        const sendMessageWithFcmPromise = await sendMessageWithFcm(user_id,obj,getPoolConnectionPromise);

        logger.log('debug','/order response : %j',commitConnectionPromise);
        callback(null,commitConnectionPromise);

    }catch(e){
        callback(e,null);
    }


}


exports.changeOrderState = async function (data,callback){

    try{
        const getPoolConnectionPromise = await getPoolConnection();
        const updateOrderStatePromise = await updateOrderState(getPoolConnectionPromise);
        await releaseConnection(getPoolConnectionPromise);
        callback(null,'success');
    }catch (e) {
        callback(e,null);
    }
}

exports.test = async function (data,callback){

    var obj = "shuttles gogogogogogo letgogogogo";
    var results = {"success" : "ok"};

    try{
        const sendMessageWithFcmPromise = await sendMessageWithFcmTest(obj);
        callback(null,results);
    }catch (e) {
        callback(e,null);
    }
}

async function updateOrderState(connection){
    logger.log('debug','scheduel - updateOrderState');
    return new Promise(function(resolve,reject){
        var updateOrderStateSql;
        var date = new Date();

        date.setMonth(date.getMonth()-1);

        updateOrderStateSql = "UPDATE orders SET state = 99 where date < ?";

        var query = connection.query(updateOrderStateSql,date,function(err,results){
            logger.log('debug','query : '+query.sql);
            if(err){return connection.rollback(function(){
                connection.release();
                return reject(err);
            })
            };
            resolve(connection);
        })

    })
}


async function releaseConnection(connection){

    return new Promise(function (resolve,reject) {
        var obj = [];
        try{
            connection.release();
        }catch (e) {
            reject(e);
        }finally {
            resolve(obj);
        }


    })
}


async function sendMessageWithFcmTest(orderInfo){
    logger.log('debug','sendMessageWithFcmTest');
    return new Promise(function (resolve,reject) {

            var push_token = "dqN_1asEQks:APA91bH_BzKTvYPfuP6wqWmrC4iUPv0Nn5fFxzmJbE9-2YJ0fRhevcXxEsdqX6VjkkUSTmlBIdsih7AeN35hP-h7XQDiG8lm0vLt6XzW9Yy3ZGR2EvvEOKuMPuMEUyFgbKz_xmKUvXjG";

            var message ={
                to : push_token,
                notification : {
                    title : "shuttles Order",
                    body : orderInfo
                }
            }

            console.log("fcm###",fcm);

            fcm.send(message,function (err,response) {
                if(err){
                    logger.log('error','FCM send fail : '+err);
                    reject(err);
                }else{
                    logger.log('debug','FCM send success');
                    resolve(response);
                }

            })

    })
}

async function sendMessageWithFcm(user_id,orderInfo,connection){
    logger.log('debug','sendMessageWithFcm');
    return new Promise(function (resolve,reject) {

        var getPushIdSql = "select pushId from user where user_id = ?";

        connection.query(getPushIdSql,user_id,function(err,pushId){
            if(err){
                logger.log('error', 'connection error' + err);
                connection.release();
                reject(err);
            }
            connection.release();

            var push_token = pushId[0].pushId;

            var message ={
                to : push_token,
                notification : {
                    title : "shuttles Order",
                    body : orderInfo
                }
            }


            fcm.send(message,function (err,response) {
                if(err){
                    logger.log('error','FCM send fail : '+err);
                    reject(err);
                }else{
                    logger.log('debug','FCM send success');
                    resolve(response);
                }
                
            })

        })

    })
}

async function getPoolConnection(){
    logger.log('debug','getPoolConnection');
    return new Promise(function(resolve,reject){

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

async function getOrders(user_id, connection){
    logger.log('debug','getOrders');

    var curdate = new Date();
    curdate.setDate(-14);

    return new Promise(function (resolve,reject) {

        var getOrdersSql = "select * from orders where user_id = ? AND date >= ? AND state != 99 order by date DESC"

        var ordersParam = [user_id,curdate];

        connection.query(getOrdersSql,ordersParam,function(err,orderList){
            if(err){
                logger.log('error', 'connection error' + err);
                connection.release();
                reject(err);
            }

            resolve(orderList);

        })
    })
}

async function getCoffeeListByOrderId(orders_id,connection){

    return new Promise(function (resolve,reject) {

        var getCoffeeListByOrderIdSql = "select co.coffee_ordersId,co.count, c.name, co.price from coffee_orders AS co JOIN coffee AS c on co.coffee_id = c.coffee_id where order_id = ?"

        connection.query(getCoffeeListByOrderIdSql, orders_id,function(err,coffeeList){
            if(err){
                logger.log('error', 'connection error' + err);
                connection.release();
                reject(err);
            }
            resolve(coffeeList);
        })

    })
}

async function getFoodListByOrderId(orders_id,connection){

    return new Promise(function (resolve,reject) {

        var getFoodListByOrderIdSql = "select fo.food_ordersId,fo.count, f.name, fo.price from food_orders AS fo JOIN food AS f on fo.food_id = f.food_id where order_id = ?"

        connection.query(getFoodListByOrderIdSql, orders_id,function(err,foodList){
            if(err){
                logger.log('error', 'connection error' + err);
                connection.release();
                reject(err);
            }
            resolve(foodList);
        })

    })
}

async function makeResponseOrderList(orders,coffeeList,foodList){

    return new Promise(function (resolve,reject) {

        var obj ={
            "order_id" : orders.order_id,
            "coffee" : coffeeList,
            "food" : foodList,
            "order_price" : orders.price,
            "order_state" : orders.state,
            "order_date" : orders.date
        }

        resolve(obj);
    })

}

async function getOrdersByOrderId(order_id,connection){
    logger.log('debug','getOrdersByOrderId');
    return new Promise(function (resolve,reject) {

        var getOrdersSql = "select * from orders where order_id = ?";

        connection.query(getOrdersSql,order_id,function(err,order){
            if(err){
                logger.log('error', 'connection error' + err);
                connection.release();
                reject(err);
            }
            resolve(order);
        })

    })
}

async function makeCoffeeListWithOption(coffeeList,connection){
    logger.log('debug','makeCoffeeListWithOption');
    return new Promise(function(resolve,reject){
        var obj = [];

        var getCoffeeOptionList = "select co.name as option_name from coffeeOption_orders AS coo JOIN coffee_option AS  co ON coo.option_id = co.option_id where coffee_ordersId = ?"

        forEach(coffeeList, async function(item,index,arr){

            connection.query(getCoffeeOptionList,coffeeList[index].coffee_ordersId,function(err,optionNameList){
                if(err){
                    logger.log('error', 'connection error' + err);
                    connection.release();
                    reject(err);
                }

                var coffeeObj = {
                    "name" : coffeeList[index].name,
                    "count" : coffeeList[index].count,
                    "price" : coffeeList[index].price,
                    "option" : optionNameList
                }
                obj.push(coffeeObj);

                if(coffeeList.length-1 == index){
                    resolve(obj);
                }
            })


        })
    })
}

async function makeFoodListWithOption(foodList,connection){
    logger.log('debug','makeFoodListWithOption');
    return new Promise(function(resolve,reject){
        var obj = [];

        if(foodList.length == 0){resolve(obj)}

        var getFoodOptionList = "select fo.name as option_name from foodOption_orders AS foo JOIN food_option AS  fo ON foo.option_id = fo.option_id where food_ordersId = ?"

        forEach(foodList, async function(item,index,arr){

            connection.query(getFoodOptionList,foodList[index].food_ordersId,function(err,optionNameList){
                if(err){
                    logger.log('error', 'connection error' + err);
                    connection.release();
                    reject(err);
                }
                var foodObj = {
                    "name" : foodList[index].name,
                    "count" : foodList[index].count,
                    "price" : foodList[index].price,
                    "option" : optionNameList
                }
                obj.push(foodObj);

                if(foodList.length-1 == index){
                    resolve(obj);
                }
            })


        })
    })
}

async function makeOrderDetailResponse(orders,coffeeObj,foodObj){
    logger.log('debug','makeOrderDetailResponse');
    return new Promise(function(resolve,reject){
        console.log("orders : ",orders);
        var obj ={
            "order_id" : orders[0].order_id,
            "order_date" : orders[0].date,
            "order_state" : orders[0].state,
            "order_address" : orders[0].address,
            "order_price" : orders[0].price,
            "order_comment" : orders[0].content,
            "coffee" : coffeeObj,
            "food" : foodObj
        }
        resolve(obj);
    })

}

async function beginTransaction(){
    logger.log('debug','beginTransaction');
    return new Promise(function(resolve,reject){

        pool.getConnection(function(err,connection){
            if(err){connection.release(); return reject(err);}

            connection.beginTransaction(function(err){
                if(err){connection.release(); return reject(err);}

                resolve(connection);

            })

        })
    })
}

async function insertOrder(data, connection){
    logger.log('debug','insertOrder');
    return new Promise(function(resolve,reject){

        var user_id  = data.user_id;
        var order_address =data.order_address;
        var order_price = data.order_price;
        var order_comment = data.order_comment;

        var addOrdersSql = "insert into orders(state,address,price,content,user_id) values(?,?,?,?,?)";

        var orders = [
            0, order_address, order_price, order_comment,user_id
        ]

        console.log("orders : ",orders);

        var query = connection.query(addOrdersSql,orders,function(err,results){
            console.log(query.sql);
            if(err){return connection.rollback(function(){
                connection.release();
                return reject(err);
            })
            }
            order_id = results.insertId;
            resolve(connection);
        })
    })
}

async function insertCoffeeOrderAndOption(coffee,connection){
    logger.log('debug','insertCoffeeOrderAndOption');
    return new Promise(function (resolve,reject) {

        forEach(coffee,function(item,index,arr){
            var insertCoffeeOrdersSql = "insert into coffee_orders(count,coffee_id,order_id,price) values(?,?,?,?)";

            var coffee_orders = [
                coffee[index].count, coffee[index].coffee_id, order_id , coffee[index].price
            ]

            console.log("coffee_orders " , coffee_orders);

            var query = connection.query(insertCoffeeOrdersSql,coffee_orders,function(err,results){
                console.log(query.sql);
                if(err){return connection.rollback(function(){
                    reject(err);
                })
                }

                var coffee_ordersId = results.insertId;

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
                                reject(err);
                            })
                            }

                        })
                    })

                }

            })
            if(coffee.length-1 == index)
                resolve(connection);
        })

    })
}

async function insertFoodOrderAndOption(food,connection){
    logger.log('debug','insertFoodOrderAndOption');
    return new Promise(function(resolve,reject){

        if(typeof food == "undefined" || food.length ==0){ console.log("food is undefined"); resolve(connection);}
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
                        return reject(err);
                    })
                    }

                    var food_ordersId = results.insertId;


                    if(typeof food[index].option == "undefined"){
                        console.log("food option is undefined");
                    }
                    else{
                        forEach(food[index].option,function(item,optionIndex,arr){

                            var insertFoodOptionSql = "insert into foodOption_orders(food_ordersId,option_id) values(?,?)";

                            var food_options = [food_ordersId,food[index].option[optionIndex].option_id];

                            var query = connection.query(insertFoodOptionSql,food_options,function(err,results){
                                console.log(query.sql);
                                if(err){return connection.rollback(function(){
                                    return reject(err);
                                })
                                }

                            })
                        })

                    }
                })

                if(food.length-1 == index)
                    resolve(connection);
            })
        }

    })
}

async function commitConnection(connection){
    logger.log('debug','commitConnection');
    return new Promise(function (resolve,reject) {

        connection.commit(function(err){
            if(err){
                return connection.rollback(function(){
                    connection.release();
                    return reject(err);
                })
            }
        });
        var obj =[{"result" : "success"}];
        resolve(obj);

    })
}