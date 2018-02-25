var express = require('express');
var router = express.Router();
var db = require('../models/orderDb');


// show orderList
router.get('/:user_id',function(req,res,next){
  console.log('userid:  ',req.params.user_id);
  db.getOrderList(req.params.user_id,function(success){
    res.json(success);  
  })
  });


// show orderdetail
router.get('/detail/:order_id',function(req,res,next){
  db.getOrderDetail(req.params.order_id,function(success){
    res.json(success);  
  })
  });


  // insert order
router.post('/',function(req,res,next){
  db.insertOrder(req.body,function(success){
    res.json(success);
  })
});


module.exports = router;