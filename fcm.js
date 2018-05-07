var FCM = require('fcm-node');
var serverKey = "AAAALBhOymk:APA91bGabW_gbZ8d02kLC_BWvSNPax9_ldFKzf74GjnN1YxErVtvSq7Tgk8nKIDpXuixGPkdyMZiU9_cBVzMGisqM1GgDu1RqSRidZ8dxjzXwGM--WBJ5WG6s5f6V_0W69D6jJzbWpzT"

var fcm = new FCM(serverKey);

module.exports = fcm;