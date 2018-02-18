var express = require('express');
var router = express.Router();
var db = require('../models/db');


// show orderList
router.get('/:user_id',function(req,res,next){
  console.log(req.params.user_id);
  db.getOrderListTemp(req.params.user_id,function(success){
    res.json(success);  
  })
  });



// show orderdetail
router.get('/detail/:order_id',function(req,res,next){
  db.getOrderDetailTemp(req.params.order_id,function(success){
    res.json(success);  
  })
  });


  // insert order
router.post('/',function(req,res,next){
  db.insertOrderTemp(req,function(success){
    res.json(success);
  })
});


module.exports = router;