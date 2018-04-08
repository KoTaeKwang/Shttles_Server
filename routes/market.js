var express = require('express');
var router = express.Router();
var db = require('../models/marketDb');
var logger = require('../winston');

router.get('/', function(req, res, next) {
    logger.log('debug','get /market');
    db.getMarketList(req,function(success){
        res.json(success);
    })
  });


  router.get('/todayMenu/:market_name', function(req, res, next) {
    logger.log('debug','get /market/todayMenu/'+req.params.market_name);
    db.getMarketTodayMenu(req.params.market_name,function(success){
        res.json(success);
    })
  });


  router.get('/combiMenu/:market_name', function(req, res, next) {
    logger.log('debug','get market/combiMenu/'+req.params.market_name);
    db.getMarketCombiMenu(req.params.market_name,function(success){
        res.json(success);
    })
  });


  router.get('/myMenu/:market_name/:user_id', function(req, res, next) {
    logger.log('debug','get /market/myMenu/'+req.params.market_name,req.params.user_id);
    db.getMarketMyMenu(req,function(success){
        res.json(success);
    })
  });

  router.post('/insertMarket',function(req,res,next){
    logger.log('debug','post /market/insertMarket'); 
    db.insertMarket(req.body,function(success){
        res.json(success);
    })
})



module.exports = router;