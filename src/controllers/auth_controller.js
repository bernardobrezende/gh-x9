'use strict'

const
  express     = require('express')
  , fs        = require('fs')
  , configs   = require('../common/Configurations')
  , ghx9rc    = require('../common/gh-x9rc')
  , request   = require('request')
  , GitHub    = require('../models/github').GitHub

// TODO: jogar para uma classe helper (ou controller base)
const _sendView = (viewName, req, res) => {
  fs.readFile(viewName, function (err, html) {
    if (err) {
      throw err
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.write(html)
    res.end()
  })
}

exports.AuthController = class AuthController {
  
  constructor() {
    this.router = express.Router()
    this.github = new GitHub()
    this.router.get('/go-to-github', (req, res) => this.goToGitHub(req, res))
    this.router.get('/github/callback', (req, res) => this.githubCallback(req, res))
    this.router.get('/', (req, res) => this.index(req, res))
  }

  // Actions
  index(req, res) {
    _sendView('./web/views/home.html', req, res)
  }

  goToGitHub(req, res) {
    const url = `${configs.github.url_auth}?client_id=${configs.github.client_id}&redirect_uri=${configs.github.redirect_uri.full}&state${configs.github.state}`;
    res.redirect(url);
  }

  githubCallback(req, res) {
    const code = req.query.code;
    if (code) {
      this.github.getAccessToken(code).then(b => {
        this.github.getUser(req.cookies['gh-x9-v2-auth']).then(l => {
          if (ghx9rc.allowed_users.indexOf(l.login) !== -1) {
            res.cookie('gh-x9-v2-auth', b.access_token)
            res.redirect('/')
            res.end()
          } else {
            res.status(401)
            _sendView('./web/views/401.html', req, res)
          }
        })
      })
    }
    else {
      res.end();
    }
  }
}
