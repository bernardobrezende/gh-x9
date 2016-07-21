'use strict';

const
  request           = require('request')
, express           = require('express')
, cookieParser      = require('cookie-parser')
, fs                = require('fs')
, str               = require('./common/String')
, configs           = require('./common/Configurations')
, open 		          = require('open')
, ghx9rc            = require('./common/gh-x9rc')
, IndexController   = require('./controllers/index_controller').IndexController
, CommitController  = require('./controllers/commit_controller').CommitController

console.log('===== CONFIGURATIONS =====');
console.log(configs);
console.log('===== /CONFIGURATIONS =====');

var WEB_FOLDER  = './web';
var COMMON_FOLDER  = './common';
var appServer = express();

appServer.use(cookieParser());
appServer.use(express.static(WEB_FOLDER));
appServer.use(express.static(COMMON_FOLDER));
appServer.use('/', new IndexController().router)
appServer.use('/commit', new CommitController().router)

/*** AUTH ***/
appServer.get('/github-auth', function(req, res){
  const url = `${configs.github.url_auth}?client_id=${configs.github.client_id}&redirect_uri=${configs.github.redirect_uri.full}&state${configs.github.state}`;
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
            res.cookie('gh-x9-v2-auth', JSON.parse(body).access_token);
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

/*** START SERVER ***/
var server = appServer.listen(process.env.PORT || configs.server.port || 3000, function () {
  console.log('GH-X9 running under %s', configs.server.base_url);
  open(configs.server.base_url);
});
