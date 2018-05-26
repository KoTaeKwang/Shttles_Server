var express = require('express');
var router = express.Router();
var db = require('../models/orderDb');
var logger = require('../winston');


// show orderList
router.get('/:user_id',function(req,res,next){
  logger.log('debug','get /order/'+req.params.user_id);
  db.getOrderList(req.params.user_id,function(err,success){
    if(err){next(err)}
    else{
       logger.log('debug','get /order/'+req.params.user_id+'  response : %j',success);
       res.json(success);
    }
  })
  });


// show orderdetail
router.get('/detail/:order_id',function(req,res,next){
  logger.log('debug','get /order/'+req.params.order_id);
  db.getOrderDetail(req.params.order_id,function(err,success){
    if(err){next(err)}
    else{
       res.json(success);
    }
  })
  });


  // insert order
router.post('/',function(req,res,next){
  logger.log('debug','post /order');
  db.insertOrder(req.body,function(err,success){
    if(err){next(err)}
    else{
       res.json(success);
    }
  })
});


// test order
router.post('/test',function(req,res,next){
    logger.log('debug','get /order');
    db.test(req,function(err,success){
        if(err){next(err)}
        else{
            res.json(success);
        }
    })
});



module.exports = router;