/**
 * Created by user on 8/17/16.
 */
var redis = require('redis');
var client = redis.createClient(6379, '127.0.0.1');

client.on('error', function (err) {
    console.log('Error ' + err);
});