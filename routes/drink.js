var express = require('express');
var router = express.Router();
var db = require('../models/coffeeDb');
var logger = require('../winston');

// show coffee list
router.get('/list', function(req, res, next) {
    logger.log('debug','get /drink/list')
    db.getCoffee(req,function(success){
        res.json(success);
      })
});
  

// show coffee detail
router.get('/detail/:coffee_id', function(req, res, next) {
    logger.log('debug','get /drink/detail/'+req.params.coffee_id);
    db.getCoffeeDetail(req.params.coffee_id,function(success){
        res.json(success);
    })
  });
    

  router.get('/todayMenu', function(req, res, next) {
    logger.log('debug','get /drink/todayMenu');
    db.getCoffeeTodayMenu(req,function(success){
        res.json(success);
    })
  });

  router.get('/combiMenu', function(req, res, next) {
    logger.log('debug','get /drink/combiMenu');
    db.getCoffeeCombiMenu(req,function(success){
        res.json(success);
    })
  });

  router.get('/myMenu/:user_id', function(req, res, next) {
    logger.log('debug','get /drink/myMenu'+req.params.user_id);
    db.getCoffeeMyMenu(req.params.user_id,function(success){
        res.json(success);
    })
  });

  router.post('/insertCoffee',function(req,res,next){
    logger.log('debug','post /drink/insertCoffee');
      db.insertCoffee(req.body,function(success){
          res.json(success);
      })
  })


  
module.exports = router;