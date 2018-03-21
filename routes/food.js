var express = require('express');
var router = express.Router();
var db = require('../models/foodDb');
//food  테이블에 description,  pictrue_version 추가

router.get('/list/:market_name',function(req,res,next){
    db.getFoodList(req.params.market_name,function(success){
        res.json(success);
    })
})


router.get('/:food_id',function(req,res,next){
    db.getFoodOption(req.params.food_id,function(success){
        res.json(success);
    })
})


router.post('/insertFood',function(req,res,next){
    db.insertFood(req.body,function(success){
        res.json(success);
    })
})

module.exports = router;