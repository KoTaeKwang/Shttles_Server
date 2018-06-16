var express = require('express');
var router = express.Router();
var db = require('../models/adminDb');
var logger = require('../winston');




// show orderList
router.get('/orders',function(req,res,next){
    logger.log('debug','get admin/orders');
    db.getAdminOrderList(req,function(err,success){
        if(err){next(err)}
        else{
            logger.log('debug','get admin/orders  response : %j',success);
            res.json(success);
        }
    })
});


// show orderdetail
router.get('/orders/detail/:order_id',function(req,res,next){
    logger.log('debug','get admin/orders/detail'+req.params.order_id);
    db.getAdminOrderDetail(req.params.order_id,function(err,success){
        if(err){next(err)}
        else{
            logger.log('debug','get admin/orders/detail/'+req.params.order_id+'  response : %j',success);
            res.json(success);
        }
    })
});


// verify order
router.post('/orders/verify',function(req,res,next){
    logger.log('debug','get admin/orders/verify'+req.body);
    db.postAdminOrderVerify(req.body,function(err,success){
        if(err){next(err)}
        else{
            logger.log('debug','get admin/orders/verify/'+req.body+'  response : %j',success);
            res.json(success);
        }
    })
});



module.exports = router;