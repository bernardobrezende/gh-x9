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
, path         = require('path')
, ghx9rc       = require('./common/gh-x9rc');

console.log('===== CONFIGURATIONS =====');
console.log(configs);
console.log('===== /CONFIGURATIONS =====');

var WEB_FOLDER  = './web';
var COMMON_FOLDER  = './common';
var appServer = express();
appServer.use(cookieParser());
appServer.use(express.static(WEB_FOLDER));
appServer.use(express.static(COMMON_FOLDER));

/*** HOME ***/
appServer.get('/', function(req, res) {
  if (req.cookies['gh-x9-auth'] === '8d2f14451cb74201c01d2bf7ed52b05db3fe2deb') {
    res.status(401);
    sendView(WEB_FOLDER + '/views/401.html', req, res);
  } else {
    sendView(WEB_FOLDER + '/views/home.html', req, res);
  }
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
        // obtendo usuário logado para verificar se está na lista dos permitidos
        request({
          url: 'https://api.github.com/user?access_token=' + JSON.parse(body).access_token,
          headers: {
            'User-Agent': 'gh-x9'
          }
        }, function(err, r, responseBody) {
          var login = JSON.parse(responseBody).login;
          if (ghx9rc.allowed_users.indexOf(login) !== -1) {
            res.cookie('gh-x9-auth', JSON.parse(body).access_token);
            res.redirect('/');  
            res.end();
          } else {
            res.status(401);
            sendView(WEB_FOLDER + '/views/401.html', req, res);
          }
        });
        
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
        onError(JSON.stringify({
          error: true,
          message: error.message,
          code: error.code,
          require_login: error.code === 401
        }));
      }
    );
  }
  else {
    onError(JSON.stringify({
      error: true,
      require_login: true,
      message: 'Efetue o login para continuar.'
    }));
  }
}

/*** START SERVER ***/
var server = appServer.listen(process.env.PORT || configs.server.port || 3000, function () {
  console.log('GH-X9 running under %s', configs.server.base_url);
  open(configs.server.base_url);
});
