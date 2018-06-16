var forEach = require('async-foreach').forEach;
var logger = require('../winston');
var pool = require('../mysql');
var Promise = require('promise');

var emptyResult = [{"result":"empty"}];


exports.getAdminOrderList = async function(req,callback){
    var obj =[];

    try{
        const getPoolConnectionPromise = await getPoolConnection();
        const getOrdersPromise = await getAdminOrders(getPoolConnectionPromise);
        if(getOrdersPromise.length ==0){
            return callback(null,emptyResult)
        }

        forEach(getOrdersPromise,async function(item,index,arr){
            const coffeeList = await getCoffeeListByOrderId(getOrdersPromise[index].order_id,getPoolConnectionPromise);
            const foodList = await getFoodListByOrderId(getOrdersPromise[index].order_id,getPoolConnectionPromise);
            const makeResponseOrderListPromise = await makeResponseOrderList(getOrdersPromise[index],coffeeList,foodList);
            console.log("Response : ",makeResponseOrderListPromise);
            logger.log('debug','admin order List : %j',makeResponseOrderListPromise);
            obj.push(makeResponseOrderListPromise);

            if(getOrdersPromise.length -1 == index){
                await releaseConnection(getPoolConnectionPromise);
                callback(null,obj);
            }
        });

    }catch (e) {
        callback(e,null);
    }

}


exports.getAdminOrderDetail = async function(order_id,callback){

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


exports.postAdminOrderVerify = async function(body,callback){

    try{
        var results ={"result" : "success"};
        var verify = body.verify;
        var order_id = body.order_id;
        console.log("verify : ",verify);
        console.log("order_id : ",order_id);
        const getPoolConnectionPromise = await getPoolConnection();
        const updateState = await updateOrderState(order_id,verify,getPoolConnectionPromise);
        callback(null,results);

    }catch (e) {
        callback(e,null);
    }

}


async function updateOrderState(order_id,verify,connection){
    logger.log('debug','updateOrderState');
    return new Promise(function(resolve,reject){
        var updateOrderStateSql;
        var state;


        if(verify == "cancel"){
            state =2;
        }else if(verify == "receive"){
            state =1;
        }else{
            var e = new Error("type is not defined");
            reject(e);
        }
        updateOrderStateSql = "UPDATE orders SET state = ? where order_id = ?";

        var updateState=[
            state,order_id
        ]


        var query = connection.query(updateOrderStateSql,updateState,function(err,results){
            logger.log('debug','query : '+query.sql);
            if(err){return connection.rollback(function(){
                connection.release();
                return reject(err);
                })
            };
            connection.release();
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

async function getAdminOrders(connection){
    logger.log('debug','getAdminOrders');
    return new Promise(function (resolve,reject) {

        var getOrdersSql = "select * from orders order by date DESC"

        connection.query(getOrdersSql,function(err,orderList){
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
    logger.log('debug','getCoffeeListByOrderId');
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
    logger.log('debug','getFoodListbyOrderId');
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
    logger.log('debug','makeResponseOrderList');
    return new Promise(function (resolve,reject) {

        var obj ={
            "order_id" : orders.order_id,
            "coffee" : coffeeList,
            "food" : foodList,
            "order_price" : orders.price,
            "order_state" : orders.state,
            "order_date" : orders.date,
            "order_userId" : orders.user_id
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
            "order_userId" : orders[0].user_id,
            "coffee" : coffeeObj,
            "food" : foodObj
        }
        resolve(obj);
    })

}
