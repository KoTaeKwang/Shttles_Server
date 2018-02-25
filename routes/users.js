var express = require('express');
var router = express.Router();
var db = require('../models/usersDb');


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/',function(req,res,next){
  db.userAdd(req.body,function(success){
    res.json(success);
  })

})
module.exports = router;
