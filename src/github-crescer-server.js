'use strict';

var http      = require('http')
, express     = require('express')
, fs          = require('fs')
, gh          = require('./github-crescer')
, str         = require('./common/String')
, open 		    = require('open')
, path        = require('path')
, PORT        = process.env.PORT || 3000;

var WEB_FOLDER  = path.join(__dirname, "web");

var appServer = express();

appServer.use(express.static(WEB_FOLDER));

appServer.get('/', function(req, res) {
  fs.readFile(WEB_FOLDER + '/views/index.html', function (err, html) {
    if (err) {
      throw err;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(html);
    res.end();
  });
});

appServer.get('/commit', function(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });

  gh.fetch(
    function(ghResponse) {
      res.end(JSON.stringify(ghResponse));
    },
    function(error) {
      var e = {
        "error": true,
        "desc": error
      };

      console.log(e);
      res.end(JSON.stringify(e));
    }
  );
});

var server = appServer.listen(PORT, function () {

  var address = 'http://localhost:' + PORT;

  console.log('GH-X9 running under %s', address);
  open(address);
});
