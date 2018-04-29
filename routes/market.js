var express = require('express');
var router = express.Router();
var db = require('../models/marketDb');
var logger = require('../winston');

router.get('/', function(req, res, next) {
    logger.log('debug','get /market');
    db.getMarketList(req,function(err,success){
        if(err){ next(err);}
        else{
            res.json(success);}
    })
  });


  router.get('/todayMenu/:market_id', function(req, res, next) {
    logger.log('debug','get /market/todayMenu/'+req.params.market_id);
    db.getMarketTodayMenu(req.params.market_id,function(err,success){
        if(err){ next(err);}
        else{
            res.json(success);}
    })
  });


  router.get('/combiMenu/:market_id', function(req, res, next) {
    logger.log('debug','get market/combiMenu/'+req.params.id);
    db.getMarketCombiMenu(req.params.market_id,function(err,success){
        if(err){ next(err);}
        else{
            res.json(success);}
    })
  });


  router.get('/myMenu/:market_id/:user_id', function(req, res, next) {
    logger.log('debug','get /market/myMenu/'+req.params.market_id,req.params.user_id);
    db.getMarketMyMenu(req,function(success){
        if(err){ next(err);}
        else{
            res.json(success);}
    })
  });

  router.post('/insertMarket',function(req,res,next){
    logger.log('debug','post /market/insertMarket'); 
    db.insertMarket(req.body,function(err,success){
        if(err){ next(err);}
        else{
            res.json(success);}
    })
})



module.exports = router;