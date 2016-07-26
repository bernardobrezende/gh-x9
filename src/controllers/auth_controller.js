'use strict'

const
  express           = require('express')
  , configs         = require('../common/Configurations')
  , ghx9rc          = require('../common/gh-x9rc')
  , GitHub          = require('../models/github').GitHub
  , BaseController  = require('./base_controller').BaseController

exports.AuthController = class AuthController extends BaseController {
  
  constructor() {
    super()
    this.router = express.Router()
    this.github = new GitHub()
    this.router.get('/go-to-github', (req, res) => this.goToGitHub(req, res))
    this.router.get('/github/callback', (req, res) => this.githubCallback(req, res))
  }

  // Actions
  goToGitHub(req, res) {
    const url = `${configs.github.url_auth}?client_id=${configs.github.client_id}&redirect_uri=${configs.github.redirect_uri.full}&state${configs.github.state}`;
    res.redirect(url);
  }

  githubCallback(req, res) {
    const code = req.query.code;
    if (code) {
      this.github.getAccessToken(code).then(b => {
        this.github.getUser(b.access_token).then(l => {
          if (ghx9rc.allowed_users.indexOf(l.login) !== -1) {
            res.cookie('gh-x9-v2-auth', b.access_token)
            res.redirect('/')
            res.end()
          } else {
            res.status(401)
            super.sendView(req, res, './web/views/401.html')
          }
        })
      })
    }
    else {
      res.end();
    }
  }
}
