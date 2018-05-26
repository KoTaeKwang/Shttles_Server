
var forEach = require('async-foreach').forEach;
var async = require('async');
var HashMap = require('hashmap');
var pool = require('../mysql');
var logger = require('../winston');
var emptyResult = [{"result":"empty"}]


exports.insertMarket = function(data,callback){
    var name = data.market_name;
    console.log("name : ",name);
    pool.getConnection(function(err,connection){
        if(err) throw err;

        var addCoffeeSql = "insert into market(market_name) values( ? )";
        connection.query(addCoffeeSql,name,function(err,addUser){
            connection.release();

            if(err) throw err;
            console.log("inserted market: ",name);
            var obj ={"success" : "ok"};
            callback(obj);
        })
    })

}

exports.getMarketList = async function(data,callback){


    try{
        const getMakretListPromise = await getMarketList();
        const responseMarketListPromise = await responseMarketList(getMakretListPromise);
        logger.log('debug','/market response : %j',responseMarketListPromise);
        callback(null,responseMarketListPromise);
    }catch (e) {
        callback(e,null);
    }

}


exports.getMarketTodayMenu = async function(market_id,callback){

    var test= true;
    if(test){
        var obj = [
            {
                "food_id": 1,
                "name": "초밥",
                "price": 2000,
                "picture_url": "https://s3.ap-northeast-2.amazonaws.com/shuttles/coffee/jimin.png",
                "picture_version": "V1",
                "description": null
            },
            {
                "food_id": 2,
                "name": "우동",
                "price": 3000,
                "picture_url": "https://s3.ap-northeast-2.amazonaws.com/shuttles/coffee/jimin.png",
                "picture_version": "V1",
                "description": null
            }
        ]
        callback(obj);
        return;
    }

    try{
        const getMarketTodayMenuPromise = await getMarketTodayMenu(market_id);
        const responseMargetTodayMenuPromise = await responseMargetMenu(getMarketTodayMenuPromise);
        logger.log('debug','/market/todayMenu/'+market_id+' response : %j',responseMargetTodayMenuPromise);
        callback(null,responseMargetTodayMenuPromise);
    } catch (e) {
        callback(e,null)
    }

}


exports.getMarketCombiMenu = async function(market_id,callback){

    var test= true;
    if(test){
        var obj = [
            {
                "food_id": 2,
                "name": "우동",
                "price": 3000,
                "picture_url": "https://s3.ap-northeast-2.amazonaws.com/shuttles/coffee/jimin.png",
                "picture_version": "V1",
                "description": null
            }
        ]
        callback(obj);
        return;
    }

    try{
        const getMarketCombiMenuPromise = await getMarketCombiMenu(market_id);
        const responseMarketCombiMenuPromise = await responseMargetMenu(getMarketCombiMenuPromise);
        logger.log('debug','/market/combiMenu/'+market_id+' response : %j',responseMarketCombiMenuPromise);
        callback(null,responseMarketCombiMenuPromise);
    }catch (e) {
        callback(e,null)
    }

}


exports.getMarketMyMenu = async function(data,callback){

    var test= true;
    if(test){
        var obj = [
            {
                "food_id": 2,
                "name": "우동",
                "price": 2000,
                "picture_url": "https://s3.ap-northeast-2.amazonaws.com/shuttles/coffee/jimin.png",
                "picture_version": "V1",
                "description": null
            }
        ]
        callback(obj);
        return;
    }

    var market_id = data.params.market_id;
    var user_id = data.params.user_id;

    try{
        const getMarketMyMenuPromise = await getMarketMyMenu(market_id,user_id);
        const responseMarketMyMenuPromise = await responseMargetMenu(getMarketMyMenuPromise);
        logger.log('debug','/market/myMenu/'+market_id+'/'+user_id+' response : %j',responseMarketMyMenuPromise);
        callback(null,responseMarketMyMenuPromise);
    }catch(e){
        callback(e,null);
    }


}


async function getMarketList(){

    return new Promise(function(resolve,reject){

        var marketListSql = "Select market_id, market_name, market_picture from market"

        pool.getConnection(function(err,connection){
            if(err) {connection.release(); return reject(err);}

            connection.query(marketListSql,function(err,marketList){
                connection.release();
                resolve(marketList);
            })
        })

    })
}

async function responseMarketList(marketList){

    return new Promise(function(resolve,reject){
        console.log('marketlist',marketList);
        var obj = [];
        if(marketList == null || marketList.length == 0) resolve(emptyResult);
        forEach(marketList,function(item,index,arr){
            var objTemp = {
                "market_id" : marketList[index].market_id,
                "market_name" : marketList[index].market_name,
                "market_picture" : marketList[index].market_picture
            }
            obj.push(objTemp);

            if(index == marketList.length-1)
                resolve(obj);
        })
    })
}

async function getMarketTodayMenu(market_id){

    return new Promise(function(resolve,reject){

        pool.getConnection(function(err,connection){
            var marketTodayMenuSql = "Select t.food_id, t.price, f.name, f.picture_url,f.picture_version,f.description from todayMarketMenu AS t Join food AS f ON t.food_id = f.food_id where t.market_id = ?"

            connection.query(marketTodayMenuSql,market_id,function(err,marketTodayMenu){
                connection.release();
                resolve(marketTodayMenu);
            })
        })

    })
}

async function responseMargetMenu(marketMenu){

    return new Promise(function(resolve,reject){

        var obj = [];

        if(marketMenu == null || marketMenu.length==0) resolve(emptyResult);

        forEach(marketMenu,function(item,index,arr){
            var objTemp ={
                "food_id" : marketMenu[index].food_id,
                "name" : marketMenu[index].name,
                "price" : marketMenu[index].price,
                "picture_url" : marketMenu[index].picture_url,
                "picture_version" : marketMenu[index].picture_version,
                "description" : marketMenu[index].description
            }

            obj.push(objTemp);

            if(index==marketMenu.length-1)
                resolve(obj);
        })

    })
}

async function getMarketCombiMenu(market_id){

    return new Promise(function(resolve,reject){

        pool.getConnection(function(err,connection){
            var marketCombiMenuSql = "Select t.food_id, t.price, f.name, f.picture_url,f.picture_version,f.description from combiMarketMenu AS t Join food AS f ON t.food_id = f.food_id where t.market_id = ?"

            connection.query(marketCombiMenuSql,market_id,function(err,marketCombiMenu){
                connection.release();
                resolve(marketCombiMenu);
            })
        })
    })
}

async function getMarketMyMenu(market_id,user_id){

    return new Promise(function(resolve,reject){

        pool.getConnection(function(err,connection){
            var markeMyMenuSql = "Select t.food_id, f.price, f.name, f.picture_url,f.picture_version,f.description from myMarketMenu AS t Join food AS f ON t.food_id = f.food_id where t.market_id = ? and t.user_id = ?"

            connection.query(markeMyMenuSql,[market_id,user_id],function(err,markeMyMenu){
                connection.relese();
                resolve(markeMyMenu);
            })
        })
    })

}


