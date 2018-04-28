var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var drink = require('./routes/drink');
var food = require('./routes/food');
var order = require('./routes/order');
var market = require('./routes/market');

var loggers = require('./winston');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/user', users);
app.use('/drink',drink);
app.use('/food',food);
app.use('/order',order);
app.use('/market',market);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var obj = {"status":"404", "reason":req.url+" not found error"}
  loggers.log('error',req.url+' not found error');
  res.status(404).json(obj);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  var obj = {"status":"500", "reason":"error : "+err.message}
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  loggers.log('error','error was occured : '+err.message);
  //res.status(err.status).send('error was occured '+err.message);
  res.status(500).json(obj);
});

app.listen(3000);
console.log("Shuttles Server started with port 3000!");

