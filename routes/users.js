var express = require('express');
var router = express.Router();
var db = require('../models/usersDb');
var logger = require('../winston');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/',function(req,res,next){
  logger.log('debug','post user/'+req.body.user_id);
  db.userAdd(req.body,function(err,success){
  
    if(err){next(err)}
    else{
       res.json(success);
    }
  })

})
module.exports = router;
