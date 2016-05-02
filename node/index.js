var express = require('express');
var http = require('http');
var redis = require('redis');
var port = (process.env.PORT || 8080);

var app = express();

console.log(process.env);

var mongoose = require('mongoose');
mongoose.connect('mongodb://' + process.env.MONGO_PORT_27017_TCP_ADDR + '/myappdatabase');
// APPROACH 1: Using environment variables created by Docker
// var client = redis.createClient(
//      process.env.REDIS_PORT_6379_TCP_PORT,
//      process.env.REDIS_PORT_6379_TCP_ADDR
// );

// APPROACH 2: Using host entries created by Docker in /etc/hosts (RECOMMENDED)
var client = redis.createClient('6379', 'redis');

var userSchema = new mongoose.Schema({
  name: {
    first: String,
    last: { type: String, trim: true }
  },
  age: { type: Number, min: 0 }
});

var PUser = mongoose.model('PowerUsers', userSchema);

app.get('/', function(req, res, next) {
  client.incr('counter', function(err, counter) {
    if(err) return next(err);
    res.send('This page has been viewed ' + counter + ' times!');
    console.log(req.baseUrl, port);
  });
});

app.get('/mongoTest', function(req, res, next) {
  // Creating one user.
  var johndoe = new PUser ({
    name: { first: 'John', last: '  Doe   ' },
    age: 25
  });

  // Saving it to the database.
  johndoe.save(function (err) {if (err) console.log ('Error on save!')});
  PUser.find({}).exec(function(err, data) {
    console.log(1, data);
    res.send(data);
  });
});

http.createServer(app).listen(process.env.PORT || 8080, function() {
  console.log('Listening on port ' + port);
});
