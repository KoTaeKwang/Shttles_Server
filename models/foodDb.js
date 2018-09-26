
var forEach = require('async-foreach').forEach;
var async = require('async');
var HashMap = require('hashmap');
var logger = require('../winston');
var pool = require('../mysql');
var emptyResult = [{"result":"empty"}]

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

exports.getFoodListByMarket = async function(market_id,callback){

    try{
        const getFoodListPromise = await getFoodListWithMarketId(market_id);
        const responseFoodListPromise = await responseFoodListWithMarket(getFoodListPromise);
        logger.log('debug','/food/list/'+market_id+' response : %j',responseFoodListPromise);
        callback(null,responseFoodListPromise);

    }catch(e){
        callback(e,null);
    }

}

exports.getFoodList = async function(data,callback){

    try{
        const getFoodListPromise = await getFoodList();
        const responseFoodListPromise = await responseFoodList(getFoodListPromise);
        logger.log('debug','/food/list response : %j',responseFoodListPromise);
        callback(null,responseFoodListPromise);

    }catch(e){
        callback(e,null);
    }

}

exports.getFoodOption = async function(food_id,callback){


    try{
        const getFoodOptionPromise = await getFoodOption(food_id);
        const responseFoodOptionPromise = await responseFoodOption(getFoodOptionPromise);
        logger.log('debug','/food/'+food_id+' response : %j',responseFoodOptionPromise);
        callback(null,responseFoodOptionPromise);
    }catch (e) {
        callback(e,null);
    }
};

exports.getFoodMyMenu = async function(user_id,callback){

    try{
        const getMyMenuFoodbyUserIDPromise = await getMyMenuFoodbyUserID(user_id);
        const responseFoodDetailbyFoodIdsPromise = await getFoodDetailbyFoodIds(getMyMenuFoodbyUserIDPromise);

        logger.log('debug','GET /food/myMenu response : %j',responseFoodDetailbyFoodIdsPromise);
        callback(null,responseFoodDetailbyFoodIdsPromise);

    }catch (e) {
        callback(e,null);
    }

};

exports.addFoodMyMenu = async function(data,callback){

    var user_id = data.user_id;
    var food_id = data.food_id;
    var market_id = data.market_id;

    try{

        const insertFoodMyMenuPromise = await insertFoodMyMenu(user_id,food_id,market_id);
        logger.log('debug','POST /food/myMenu response : %j',insertFoodMyMenuPromise);
        callback(null,insertFoodMyMenuPromise);

    }catch (e) {
        callback(e,null);
    }

};


async function getFoodListWithMarketId(market_id){

    return new Promise(function(resolve,reject){
        var foodListSql = "Select food_id,name,price,picture_url,description from food where market_id = ?";
        pool.getConnection(function(err,connection){
            if(err){ connection.release(); return reject(err);}

            connection.query(foodListSql,market_id,function(err,foodList){
                connection.release();
                resolve(foodList)
            })
        })

    })

}

async function getFoodList(){

    return new Promise(function(resolve,reject){
        var foodListSql = "select f.food_id, f.name, f.food_state, f.price, f.picture_url, f.picture_version, f.description, m.market_name, m.market_id from food AS f JOIN market AS m ON f.market_id = m.market_id";
        pool.getConnection(function(err,connection){
            if(err){ connection.release(); return reject(err);}

            connection.query(foodListSql,function(err,foodList){
                connection.release();
                resolve(foodList)
            })
        })

    })

}

async function responseFoodList(foodList){
    var obj = [];
    return new Promise(function(resolve,reject){
        if(foodList == null || foodList.length==0) return resolve(emptyResult);

        forEach(foodList,function(item,index,arr){
            var objTemp = {
                "food_id" : foodList[index].food_id,
                "name" : foodList[index].name,
                "price" : foodList[index].price,
                "picture_url" : foodList[index].picture_url,
                "picture_version" : foodList[index].picture_version,
                "description" : foodList[index].description,
                "state" : foodList[index].market_name,
                "market_id" : foodList[index].market_id,
                "isAvailable" : foodList[index].food_state
            }

            obj.push(objTemp);

            if(index== foodList.length-1)
                resolve(obj);
        })
    })
}

async function responseFoodListWithMarket(foodList){
    var obj = [];
    return new Promise(function(resolve,reject){
        if(foodList == null || foodList.length==0) return resolve(emptyResult);

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
                resolve(obj);
        })
    })
}

async function getFoodOption(food_id){

    return new Promise(function(resolve,reject){
        var foodOptionSql = "Select option_id,name,price from food_option where food_id = ?"

        pool.getConnection(function(err,connection){
            if(err) {connection.release(); return reject (err);}

            connection.query(foodOptionSql,food_id,function(err,foodOption){
                connection.release();
                resolve(foodOption);
            })

        })
    })

}

async function responseFoodOption(foodOption){

    return new Promise(function(resolve,reject){
        var obj = [];

        if(foodOption == null || foodOption.length==0) return resolve(emptyResult);
        forEach(foodOption,function(item,index,arr){
            var objTemp = {
                "option_id" : foodOption[index].option_id,
                "option_name" : foodOption[index].name,
                "option_price" : foodOption[index].price
            }
            obj.push(objTemp);

            if(index == foodOption.length-1)
                resolve(obj);
        })

    })
}

async function getMyMenuFoodbyUserID(user_id){

    return new Promise(function(resolve,reject){

        pool.getConnection(function(err,connection){
            var myMenuSql = "Select food_id from myMarketMenu where user_id = ?";

            connection.query(myMenuSql,user_id,function(err,myMenu){
                connection.release();
                if(err){return reject(err)};
                logger.log('debug','query '+myMenuSql+'['+user_id+']');
                resolve(myMenu);
            })
        })

    });
}

async function getFoodDetailbyFoodIds(foodIds){
    var obj = [];

    return new Promise(function(resolve,reject){

        if(foodIds.length==0) return resolve(emptyResult);

        pool.getConnection(function(err,connection){
            if(err){return reject(err)};
            var foodListSql = "select f.food_id, f.name, f.price, f.picture_url, f.picture_version, f.description, m.market_name, m.market_id from food AS f JOIN market AS m ON f.market_id = m.market_id where f.food_id = ?";

            forEach(foodIds,function(item,index,arr){

                connection.query(foodListSql,foodIds[index].food_id,function(err,foodList){
                    logger.log('debug','query '+foodListSql+" "+foodIds[index].food_id);

                    if(err){return reject(err)};
                    console.log("foodList : ",foodList);

                    var objTemp = {
                        "food_id" : foodList[index].food_id,
                        "name" : foodList[index].name,
                        "price" : foodList[index].price,
                        "picture_url" : foodList[index].picture_url,
                        "picture_version" : foodList[index].picture_version,
                        "description" : foodList[index].description,
                        "state" : foodList[index].market_name,
                        "market_id" : foodList[index].market_id
                    }

                    obj.push(objTemp);

                    if(index==foodIds.length-1){
                        connection.release();
                        resolve(obj);
                    }
                })
            })
        })
    })
}

async function insertFoodMyMenu(user_id,food_id,market_id){

    return new Promise(function(resolve,reject){

        pool.getConnection(function(err,connection){

            var addMyMenuSql = "insert into myMarketMenu(user_id,food_id,market_id) values(? , ?, ?)";

            var addMyMenuParam = [user_id, food_id, market_id];

            connection.query(addMyMenuSql,addMyMenuParam,function(err,addMymenu){

                connection.release();

                if(err) return reject(err);
                var obj ={"result" : "success"};
                resolve(obj);

            })
        })
    })
}