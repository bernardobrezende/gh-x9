'use strict';

var
  request      = require('request')
, express      = require('express')
, cookieParser = require('cookie-parser')
, fs           = require('fs')
, gh           = require('./github-crescer')
, str          = require('./common/String')
, configs      = require('./common/Configurations')
, open 		     = require('open')
, path         = require('path');

console.log('===== CONFIGURATIONS =====');
console.log(configs);
console.log('===== /CONFIGURATIONS =====');

var WEB_FOLDER  = './web';
var appServer = express();
appServer.use(cookieParser());
appServer.use(express.static(WEB_FOLDER));

/*** HOME ***/
appServer.get('/', function(req, res) {
  sendView(WEB_FOLDER + '/views/home.html', req, res);
});

appServer.get('/commit', function(req, res) {
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  var token = req.cookies['gh-x9-auth'];

  var onSuccess = function(ghResponse) {
    res.end(ghResponse);
  };

  var onError = function(errResponse) {
    res.end(errResponse);
  };

  fetchGhApi(token, onSuccess, onError);
});



/*** AUTH ***/
appServer.get('/github-auth', function(req, res){
  var url = configs.github.url_auth
            + '?client_id=' + configs.github.client_id
            + '&redirect_uri=' + configs.github.redirect_uri.full
            + '&state' + configs.github.state;

  res.redirect(url);
});

appServer.get(configs.github.redirect_uri.relative, function(req, res){
  var code = req.query.code;

  if(code) {
    var options = {
      url:'https://github.com/login/oauth/access_token',
      form: {
        'client_id' : configs.github.client_id,
        'client_secret': configs.github.client_secret,
        'code': code,
        'redirect_uri': configs.github.redirect_uri.full,
        'state': configs.github.state
      },
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      }
    };

    var callback = function(err, httpResponse, body) {
      if(err) {
        res.write('<pre>' + err + '</pre>');
        res.end();
      }
      else {
        res.cookie('gh-x9-auth', JSON.parse(body).access_token);
        res.redirect('/');
        res.end();
      }
    };

    request(options, callback);
  }
  else {
    res.end();
  }
});


/*** PRIVATE ***/
function sendView(viewName, req, res) {
  fs.readFile(viewName, function (err, html) {
    if (err) {
      throw err;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write(html);
    res.end();
  });
};

function fetchGhApi(accessToken, onSuccess, onError) {
  if(!!accessToken) {
    gh.authenticate(accessToken);
    gh.fetch(
      function(ghResponse) {
        onSuccess(JSON.stringify(ghResponse));
      },
      function(error) {
        var e = {
          "error": true,
          "desc": error
        };
        onError(JSON.stringify(e));
      }
    );
  }
  else {
    onError(JSON.stringify({
      error: true,
      desc: {
        require_login: true,
        message: 'Efetue o login para continuar.'
      }
    }));
  }
}

/*** START SERVER ***/
var server = appServer.listen(configs.server.port, function () {
  console.log('GH-X9 running undex %s', configs.server.base_url);
  open(configs.server.base_url);
});
