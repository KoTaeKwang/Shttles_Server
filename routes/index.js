var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express_yoyo' });
});

router.get('/test',function(req,res,next){
  var obj = {"name" : "americano", "url" : "https://s3.ap-northeast-2.amazonaws.com/shuttles/coffee/jimin.png"}
  res.json(obj);
});


module.exports = router;
