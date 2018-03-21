var express = require('express');
var router = express.Router();
var db = require('../models/marketDb');

router.get('/', function(req, res, next) {
    db.getMarketList(req,function(success){
        res.json(success);
    })
  });


  router.get('/todayMenu/:market_name', function(req, res, next) {
    console.log("market_name : ",req.params.market_name);
    db.getMarketTodayMenu(req.params.market_name,function(success){
        res.json(success);
    })
  });


  router.get('/combiMenu/:market_name', function(req, res, next) {
    console.log("market_name : ",req.params.market_name);
    db.getMarketCombiMenu(req.params.market_name,function(success){
        res.json(success);
    })
  });


  router.get('/mymenu/:market_name/:user_id', function(req, res, next) {
    console.log("market_name : ",req.params.market_name);
    console.log("user_id : ",req.params.user_id);
    db.getMarketMyMenu(req,function(success){
        res.json(success);
    })
  });

  router.post('/insertMarket',function(req,res,next){
    db.insertMarket(req.body,function(success){
        res.json(success);
    })
})



module.exports = router;