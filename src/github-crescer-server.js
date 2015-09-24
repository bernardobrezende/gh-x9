'use strict';

var http      = require('http')
, dispatcher  = require('httpdispatcher')
, fs          = require('fs')
, gh          = require('./github-crescer')
, str         = require('./common/String')
, PORT = process.env.PORT || 3000
, server = http.createServer(
  function(request, response) {
    try {
      console.log(request.url);
      dispatcher.dispatch(request, response);
    } catch(err) {
      console.log('Server error: ', err);
    }
  }

);

dispatcher.setStaticDirname('common');
dispatcher.setStatic('String.js');

dispatcher.onGet('/', function(req, res) {
  fs.readFile(__dirname + '/views/index.html', function (err, html) {
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
