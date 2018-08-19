
var forEach = require('async-foreach').forEach;
var async = require('async');
var HashMap = require('hashmap');
var logger = require('../winston');
var pool = require('../mysql');
var Promise = require('promise');


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


exports.getCoffee =  async function (data, callback) {

    try{
        const getCoffeeListPromise = await getCoffeeList();
        const responseCoffeeListPromise = await responseCoffeeList(getCoffeeListPromise);
        callback(null,responseCoffeeListPromise);
    }catch(e){
        callback(e,null);
    }

};


exports.getCoffeeDetail = async function (coffee_id, callback) {

    try{
        const getCoffeeDetailPromise = await getCoffeeOption(coffee_id);
        logger.log('debug','/drink/detail response : %j',getCoffeeDetailPromise);
        callback(null,getCoffeeDetailPromise);
    }catch(e){
        callback(e,null);
    }
};


exports.getCoffeeTodayMenu = async function(data,callback){

    try{
        const getCoffeeTodayMenuPromise = await getCoffeeTodayMenu();
        const responseCoffeeTodayMenuPromise = await responseCoffeeTodayMenu(getCoffeeTodayMenuPromise);
        logger.log('debug','/drink/todayMenu response : %j',responseCoffeeTodayMenuPromise);
        callback(null,responseCoffeeTodayMenuPromise);

    }catch(e){
        callback(e,null);
    }
};

exports.getCoffeeCombiMenu = async function(data,callback){

    try{
        const getCoffeeCombiMenuPromise = await getCoffeeCombiMenu();
        const responseCoffeeCombiMenuPromise = await responseCoffeeTodayMenu(getCoffeeCombiMenuPromise);
        logger.log('debug','/drink/combiMenu response : %j',responseCoffeeCombiMenuPromise);
        callback(null,responseCoffeeCombiMenuPromise);

    }catch(e){
        callback(e,null);
    }
};

exports.getCoffeeMyMenu = async function(user_id,callback){

    try{
        const getCoffeeIdsPromise = await getCoffeeIdsbyUserID(user_id);
        const responseCoffeeMyMenuPromise = await getCoffeeDetailbyCoffeeIds(getCoffeeIdsPromise);
        logger.log('debug','GET /drink/myMenu response : %j',responseCoffeeMyMenuPromise);
        callback(null,responseCoffeeMyMenuPromise);

    }catch(e){
        callback(e,null);
    }
};

exports.addCoffeeMyMenu = async function(data,callback){

    var user_id = data.user_id;
    var coffee_id = data.coffee_id;

    try{

        const insertCoffeeMyMenuPromise = await insertCoffeeMyMenu(user_id,coffee_id);
        logger.log('debug','POST /drink/myMenu response : %j',insertCoffeeMyMenuPromise);
        callback(null,insertCoffeeMyMenuPromise);

    }catch (e) {
        callback(e,null);
    }

}

async function getCoffeeList() {

    return new Promise(function(resolve,reject){

        var coffeeListSql = "select coffee.coffee_id, coffee.name, coffee.picture_url, coffee.description, coffee.today_menu, coffee.picture_version, coffee_size.price , coffee_size.today_price, coffee_state.name as state\n" +
            " from coffee as coffee  inner join coffee_size as coffee_size on coffee.coffee_id = coffee_size.coffee_id inner join coffee_state as coffee_state on coffee.coffee_id = coffee_state.coffee_id;"
        pool.getConnection(function (err, connection) {
            if (err) {
                return reject(err)
            }
            ;

            connection.query(coffeeListSql, function (err, coffeeList) {
                connection.release();
                if (err) {
                    return reject(err)
                }
                ;

                logger.log('debug', 'query ' + coffeeListSql);
                console.log("coffeelist",coffeeList);
                resolve(coffeeList);
            })
        })


    })


}

async function responseCoffeeList(coffeeList){

    return new Promise(function(resolve, reject){

        var obj = [];
        console.log("response",coffeeList)
        forEach(coffeeList,function(item,index,arr){

            var price;
            if(coffeeList[index].today_menu){
                price = coffeeList[index].today_price;
            }else{
                price = coffeeList[index].price;
            }

            var objTemp = {
                "coffee_id" : coffeeList[index].coffee_id,
                "name" : coffeeList[index].name,
                "picture_url" : coffeeList[index].picture_url,
                "picture_version" : coffeeList[index].picture_version,
                "description" : coffeeList[index].description,
                "price" : price,
                "state" : coffeeList[index].state
            }

            obj.push(objTemp);


            if(index==coffeeList.length-1)
                resolve(obj);
        })

    })


};

async function getCoffeeOption(coffee_id){

    return new Promise(function(resolve,reject){

        var obj =[];

        var coffeeOptionListSql = "Select option_id,name,price from coffee_option where coffee_id = ?"

        pool.getConnection(function(err,connection){
            if(err){return reject(err)};

            connection.query(coffeeOptionListSql,coffee_id,function(err,coffeeOptionList){
                if(err){return reject(err)};
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
                        resolve(obj);

                })
            })
        })

    })


}

async function getCoffeeTodayMenu(){

    return new Promise(function(resolve,reject){

        pool.getConnection(function(err,connection){
            var coffeeTodayMenuSql = "SELECT c.coffee_id, cs.today_price, c.name,c.picture_url,c.picture_version,c.description " +
                "from coffee_size AS cs JOIN coffee AS c ON cs.coffee_id = c.coffee_id where c.today_menu = 1";

            connection.query(coffeeTodayMenuSql,function(err,coffeeTodayMenu){
                connection.release();
                if(err){return reject(err)};

                logger.log('debug','query '+coffeeTodayMenuSql);
                resolve(coffeeTodayMenu);
            })
        })

    })
}

async function responseCoffeeTodayMenu(coffeeTodayMenu){

    var obj =[];

    return new Promise(function(resolve,reject){

        if(coffeeTodayMenu.length==0) {return resolve(emptyResult)}

        forEach(coffeeTodayMenu,function(item,index,arr){
            var objTemp = {
                "coffee_id" : coffeeTodayMenu[index].coffee_id,
                "name" : coffeeTodayMenu[index].name,
                "price" : coffeeTodayMenu[index].today_price,
                "picture_url" : coffeeTodayMenu[index].picture_url,
                "version" : coffeeTodayMenu[index].picture_version,
                "description" : coffeeTodayMenu[index].description
            }
            obj.push(objTemp);

            if(index== coffeeTodayMenu.length-1)
                resolve(obj);
        })
    })
}

async function getCoffeeCombiMenu(){

    return new Promise(function(resolve,reject){

        pool.getConnection(function(err,connection){
            var coffeeCombiMenuSql = "SELECT t.coffee_id, t.price, c.name,c.picture_url,c.picture_version,c.description from combiDrinkMenu AS t JOIN coffee AS c ON t.coffee_id = c.coffee_id";

            connection.query(coffeeCombiMenuSql,function(err,coffeeCombiMenu){
                logger.log('debug','query '+coffeeCombiMenuSql);
                connection.release();
                if(err){return reject(err)};
                resolve(coffeeCombiMenu);
            })
        })

    })
}

async function getCoffeeIdsbyUserID(user_id){

    return new Promise(function(resolve,reject){

        pool.getConnection(function(err,connection){
            var myMenuSql = "Select coffee_id from myDrinkMenu where user_id = ?";

            connection.query(myMenuSql,user_id,function(err,myMenu){
                connection.release();
                if(err){return reject(err)};
                logger.log('debug','query '+myMenuSql+'['+user_id+']');
                resolve(myMenu);
            })
        })

    })
}

async function getCoffeeDetailbyCoffeeIds(coffeeIds){
    var obj = [];

    return new Promise(function(resolve,reject){

        if(coffeeIds.length==0) return resolve(emptyResult);

        pool.getConnection(function(err,connection){
            if(err){return reject(err)};
            var coffeeListSql = "Select coffee_id, name, picture_url, picture_version, description from coffee where coffee_id = ?";

            forEach(coffeeIds,function(item,index,arr){

                connection.query(coffeeListSql,coffeeIds[index].coffee_id,function(err,coffeeList){
                    logger.log('debug','query '+coffeeListSql+" "+coffeeIds[index].coffee_id);

                    if(err){return reject(err)};
                    console.log("coffeeList : ",coffeeList);

                    var objTemp = {
                        "coffee_id" : coffeeList[0].coffee_id,
                        "name" : coffeeList[0].name,
                        "picture_url" : coffeeList[0].picture_url,
                        "version" : coffeeList[0].picture_version,
                        "description" : coffeeList[0].description
                    }

                    obj.push(objTemp);

                    if(index==coffeeIds.length-1){
                        connection.release();
                        resolve(obj);
                    }
                })
            })
        })
    })
}

async function insertCoffeeMyMenu(user_id,coffee_id){

    return new Promise(function(resolve,reject){

        pool.getConnection(function(err,connection){

            var addMyMenuSql = "insert into myDrinkMenu(user_id,coffee_id) values(? , ?)";

            var addMyMenuParam = [user_id, coffee_id];

            connection.query(addMyMenuSql,addMyMenuParam,function(err,addMymenu){

                connection.release();

                if(err) return reject(err);
                var obj ={"success" : "ok"};
                resolve(obj);

            })
        })
    })
}

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
            callback(null,obj);
        })
    })

}