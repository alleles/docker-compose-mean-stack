var express = require('express');
var http = require('http');
var redis = require('redis');
var consul = require('consul')({ host: 'dockerstack_consul_1' });
var port = (process.env.PORT || 8080);

/*
var consulOptions = { 
	name: 'autoBuyer-web',
    id: 'ab-web',
	tags: ['service'],
	port: port
};

setTimeout(function(){
    consul.agent.service.register(consulOptions, function(err) {
        if (err) {
            console.log('CONSUL REGISTRATION ERROR', err);
        }
    });

    console.log('PROCESS.ENV', process.env)
}, 10000);
*/

var app = express();

// APPROACH 1: Using environment variables created by Docker
// var client = redis.createClient(
//      process.env.REDIS_PORT_6379_TCP_PORT,
//      process.env.REDIS_PORT_6379_TCP_ADDR
// );

// APPROACH 2: Using host entries created by Docker in /etc/hosts (RECOMMENDED)
var client = redis.createClient('6379', 'redis');


app.get('/', function(req, res, next) {
  client.incr('counter', function(err, counter) {
    if(err) return next(err);
    res.send('This page has been viewed ' + counter + ' times!');
    console.log(req.baseUrl, port);
  });
});

http.createServer(app).listen(process.env.PORT || 8080, function() {
  console.log('Listening on port ' + port);
});
