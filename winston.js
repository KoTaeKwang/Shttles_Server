var winston = require('winston');
require('winston-daily-rotate-file');
var moment = require('moment');
var fs = require('fs');
var path = require('path');

if(!fs.existsSync('logs')) fs.mkdirSync('logs');
const logFilename = path.join(__dirname,'/../','logs','/logfile.log');

var logger = new winston.Logger({
    transports : [
            new winston.transports.Console({
                level:'debug',
                handleExceptions:true,
                timestamp:function(){
                    return moment().format("YYYY-MM-DD HH:mm:ss");
                },
                colorize:true
            }),
            new winston.transports.DailyRotateFile({
                level:'debug',
                handleExceptions:true,
                timestamp:function(){
                    return moment().format("YYYY-MM-D HH:mm:ss");
                },
                filename:logFilename,
                datePattern:'yyyy-MM-dd',
                json:false,
                maxsize:1024*1024*100, //100mb
                maxFiles:10
            })
    ]
})

module.exports = logger;