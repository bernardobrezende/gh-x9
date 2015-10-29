'use strict';

var http      = require('http')
, dispatcher  = require('httpdispatcher')
, fs          = require('fs')
, gh          = require('./github-crescer')
, str         = require('./common/String')
, open 		    = require('open')
, PORT        = process.env.PORT || 3000
, server      = http.createServer(
  function(request, response) {
    try {
      console.log(request.url);
      dispatcher.dispatch(request, response);
    } catch(err) {
      console.log('Server error: ', err);
    }
  }

);

dispatcher.setStaticDirname('web');


// CSS
dispatcher.setStatic('bower_components/normalize-css/normalize.css');
dispatcher.setStatic('bower_components/bootstrap/dist/css/bootstrap.min.css');

// JS
dispatcher.setStatic('bower_components/jquery/dist/jquery.min.js');
dispatcher.setStatic('bower_components/bootstrap/dist/js/bootstrap.min.js');
dispatcher.setStatic('bower_components/angular/angular.min.js');
dispatcher.setStatic('js/app.js');

// CSS
dispatcher.setStatic('css/app.css');

// RESOURCES
dispatcher.setStatic('resources/img/megaman.gif');
dispatcher.setStatic('resources/img/github-megaman.jpg');
dispatcher.setStatic('resources/img/favicon.ico');

dispatcher.onGet('/', function(req, res) {
  fs.readFile(__dirname + '/web/views/index.html', function (err, html) {
    if (err) {
      throw err;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(html);
    res.end();
  });
});

dispatcher.onGet('/commit', function(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  gh.fetch(
    // callback
    function(ghResponse) {
      res.end(JSON.stringify(ghResponse));
    }
  );
});

server.listen(PORT, function() {
  console.log('Rodando na porta %s...', PORT);
});

open('http://localhost:' + PORT);
