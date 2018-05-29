var express = require('express');
var router = express.Router();
var db = require('../models/noticeDb');
var logger = require('../winston');

router.get('/',function(req,res,next){
    logger.log('debug','get /notice');
    db.getNotice(req,function(err,success){
        if(err){ next(err);}
        else{
            res.json(success);}
    })
});

router.get('/detail/:notice_id',function (req,res,next) {
    logger.log('debug','get/notice/detail'+req.params.notice_id);
    db.getNoticeDetail(req.params.notice_id,function(err,success){
        if(err){next(err);}
        else{
            res.json(success);
        }
    })
});

module.exports = router;