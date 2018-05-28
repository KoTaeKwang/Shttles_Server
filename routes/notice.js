var express = require('express');
var router = express.Router();
var db = require('../models/noticeDB');
var logger = require('../winston');

router.get('/',function(req,res,next){
    logger.log('debug','get /notice');
    db.getNotice(req,function(err,success){
        if(err){ next(err);}
        else{
            res.json(success);}
    })
});


module.exports = router;