var express = require('express');
var router = express.Router();
var db = require('../models/coffeeDb');

// show coffee list
router.get('/list', function(req, res, next) {
    db.getCoffee(req,function(success){
        res.json(success);
      })
});
  

// show coffee detail
router.get('/:coffee_id', function(req, res, next) {
    console.log("coffee_id : ",req.params.coffee_id);
    db.getCoffeeDetail(req.params.coffee_id,function(success){
        res.json(success);
    })
  });
    

  router.get('/todayMenu', function(req, res, next) {
    db.getCoffeeTodayMenu(req,function(success){
        res.json(success);
    })
  });

  router.get('/combiMenu', function(req, res, next) {
    db.getCoffeeCombiMenu(req,function(success){
        res.json(success);
    })
  });

  router.get('/myMenu', function(req, res, next) {
    db.getMarketMyMenu(req.params.user_id,function(success){
        res.json(success);
    })
  });



  
module.exports = router;