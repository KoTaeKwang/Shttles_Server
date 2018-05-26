
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


exports.getFoodList = async function(market_id,callback){

    try{
        const getFoodListPromise = await getFoodList(market_id);
        const responseFoodListPromise = await responseFoodList(getFoodListPromise);
        logger.log('debug','/food/list/'+market_id+' response : %j',responseFoodListPromise);
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
}




async function getFoodList(market_id){

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


