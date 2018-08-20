var express = require('express');
var router = express.Router();
var db = require('../models/foodDb');
var logger = require('../winston');
//food  테이블에 description,  pictrue_version 추가

router.get('/list/:market_id',function(req,res,next){
    logger.log('debug','get /food/list/'+req.params.market_id);
    db.getFoodListByMarket(req.params.market_id,function(err,success){
        if(err){ next(err);}
        else{
        res.json(success);}
    })
})


router.get('/list',function(req,res,next){
    logger.log('debug','get /food/list');
    db.getFoodList(req,function(err,success){
        if(err){ next(err);}
        else{
            res.json(success);}
    })
})



router.get('/:food_id',function(req,res,next){
    logger.log('debug','get /food/'+req.param.food_id);
    db.getFoodOption(req.params.food_id,function(err,success){
        if(err){ next(err);}
        else{
            res.json(success);}
    })
})


router.post('/insertFood',function(req,res,next){
    logger.log('debug','post /food/insertFood');
    db.insertFood(req.body,function(err,success){
        if(err){ next(err);}
        else{
            res.json(success);}
    })
})


router.get('/myMenu/:user_id', function(req, res, next) {
    logger.log('debug','get /food/myMenu/'+req.params.user_id);
    db.getFoodMyMenu(req.params.user_id,function(err,success){
        if(err){next(err)}
        else{
            res.json(success);
        }
    })
});

router.post('/myMenu', function(req, res, next) {
    logger.log('debug','post /food/myMenu/ %j',req.body);
    db.addFoodMyMenu(req.body,function(err,success){
        if(err){next(err)}
        else{
            res.json(success);
        }
    })
});


module.exports = router;

