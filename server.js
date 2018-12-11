//  OpenShift sample Node application
var express = require('express'),
  app = express(),
  morgan = require('morgan'),
  path = require("path")

Object.assign = require('object-assign')

app.engine('html', require('ejs').renderFile);
app.use(morgan('combined'))
app.set('views', path.join(__dirname, './'));

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080
var ip = process.env.IP || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0'


const mongoURL = process.env.uri || null
const username = process.env.username
const password = process.env.password
const databaseName = process.env.database_name

var db = null,
  dbDetails = new Object();

var initDb = function (callback) {
  if (mongoURL == null) return;

  var mongodb = require('mongodb');
  if (mongodb == null) return;

  const url = new URL(mongoURL)
  const mongoLoginURI = url.protocol + "//" + username + ":" + password + "@" + url.host + "/" + databaseName
  console.log(mongoLoginURI)

  mongodb.connect(mongoLoginURI, function (err, conn) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = databaseName;
    dbDetails.url = mongoURL;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};

app.get('/pagecount', function (req, res) {
  // try to initialize the db on every request if it's not already
  // initialized.
  if (!db) {
    initDb(function (err) { });
  }
  if (db) {
    db.collection('counts').count(function (err, count) {
      res.send('{ pageCount: ' + count + '}');
    });
  } else {
    res.send('{ pageCount: -1 }');
  }
});

// error handling
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function (err) {
  console.log('Error connecting to Mongo. Message:\n' + err);
});




// app.get('/', function (req, res) {
//  if (!db) {
//    initDb(function (err) { });
//  }
//  if (db) {
//    var col = db.collection('counts');
//    // Create a document with request IP and current time of request
//    col.insert({ ip: req.ip, date: Date.now() });
//    col.count(function (err, count) {
//      if (err) {
//        console.log('Error running count. Message:\n' + err);
//      }
//      res.render('index.html', { pageCountMessage: count, dbInfo: dbDetails });
//    });
//  } else {
//    res.render('index.html');
//  }
// });





app.get('/', function (req, res) { 
  res.render('helloworld.html');
});
























app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app;
