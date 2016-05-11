var koa = require('koa');
var jwt = require('koa-jwt');
var route = require('koa-route');
var request = require('co-request');
var mongo = require('./server/config/mongo');
var app = koa();

app.init = co.wrap(function *(overwriteDB) {
    // initialize mongodb and populate the database with seed data if empty
    yield mongo.connect();
    yield mongoSeed(overwriteDB);

    // koa config
    koaConfig(app);

    // create http and websocket servers and start listening for requests
    app.server = app.listen(config.app.port);
    ws.listen(app.server);
    if (config.app.env !== 'test') {
        console.log('KOAN listening on port ' + config.app.port);
    }
});


// x-response-time
app.use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  this.set('X-Response-Time', ms + 'ms');
});

// logger

app.use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  console.log('%s %s - %s', this.method, this.url, ms);
});

// Custom 401 handling if you don't want to expose koa-jwt errors to users
app.use(function *(next){
  try {
    yield next;
  } catch (err) {
    if (401 == err.status) {
      this.status = 401;
      this.body = 'Protected resource, use Authorization header to get access\n';
    } else {
      throw err;
    }
  }
});

// Public endpoint to login.
app.use(function *(next) {
  if (this.url.match(/^\/login/)) {
    console.log(this.request);
    var claims = this.request.body;
    var token = jwt.sign(claims, 'shared-secret', {algorithm: 'RS256'});
    this.status = 200;
    this.body = {token: token};
  } else {
    yield next;
  }
});

// Unprotected middleware
app.use(function *(next){
  if (this.url.match(/^\/public/)) {
    this.body = 'unprotected\n';
  } else {
    yield next;
  }
});

// Middleware below this line is only reached if JWT token is valid
app.use(jwt({ secret: 'shared-secret' }));

// Protected middleware
app.use(function *(){
  if (this.url.match(/^\/api/)) {
    this.body = 'protected\n';
  }
});

// response

app.use(function *(){
  this.body = 'Hello World';
});

app.listen(3000);
