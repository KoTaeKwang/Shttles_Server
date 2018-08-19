var express = require('express');
var router = express.Router();
var db = require('../models/coffeeDb');
var logger = require('../winston');

// show coffee list
router.get('/list', function(req, res, next) {
    logger.log('debug','get /drink/list')
    db.getCoffee(req,function(err,success){
        if(err){next(err)}
        else{
           res.json(success);
        }
      })
});
  

// show coffee detail
router.get('/detail/:coffee_id', function(req, res, next) {
    logger.log('debug','get /drink/detail/'+req.params.coffee_id);
    db.getCoffeeDetail(req.params.coffee_id,function(err,success){
        if(err){next(err)}
        else{
           res.json(success);
        }
    })
  });
    

  router.get('/todayMenu', function(req, res, next) {
    logger.log('debug','get /drink/todayMenu');
    db.getCoffeeTodayMenu(req,function(err,success){
        if(err){next(err)}
        else{
           res.json(success);
        }
    })
  });

  router.get('/combiMenu', function(req, res, next) {
    logger.log('debug','get /drink/combiMenu');
    db.getCoffeeCombiMenu(req,function(err,success){
        if(err){next(err)}
        else{
           res.json(success);
        }
    })
  });

  router.get('/myMenu/:user_id', function(req, res, next) {
    logger.log('debug','get /drink/myMenu/'+req.params.user_id);
    db.getCoffeeMyMenu(req.params.user_id,function(err,success){
        if(err){next(err)}
        else{
           res.json(success);
        }
    })
  });

router.post('/myMenu', function(req, res, next) {
    logger.log('debug','post /drink/myMenu/ %j',req.body);
    db.addCoffeeMyMenu(req.body,function(err,success){
        if(err){next(err)}
        else{
            res.json(success);
        }
    })
});

  router.post('/insertCoffee',function(req,res,next){
    logger.log('debug','post /drink/insertCoffee');
      db.insertCoffee(req.body,function(err,success){
        if(err){next(err)}
        else{
           res.json(success);
        }
      })
  })


  
module.exports = router;