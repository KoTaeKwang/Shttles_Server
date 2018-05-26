var FCM = require('fcm-node');
var serverKey = "AAAAKTqrMdc:APA91bFqcwEW1sui2Z5Ru3n1coe8cUeVfg2N1VxVaKzYiwDr7rdzZAf3SbeEZZWTJupvphKyxP5G4QQ9hcHfMH7Em9oGkIQRjjtLKXCz-_eQVuwRFHGsDZLMG6ADfzA0NlwcyU-KnJAj"

var fcm = new FCM(serverKey);

module.exports = fcm;