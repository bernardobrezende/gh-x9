const
  request     = require('request')
  , configs   = require('../common/Configurations')

exports.GitHub = class GitHub {

  constructor() {
    const GitHubApi = require('github')
    this.api = new GitHubApi({
      version: '3.0.0',
      timeout: 10000
    })
  }

  authenticate(token) {
    this.api.authenticate({
      type: 'oauth',
      token: token
    })
  }

  // TO-DO: verificar se as operações access_token já não estão implementadas no módulo pra node
  // aí podemos dispensar a request
  getAccessToken(code) {
    return new Promise((resolve, reject) => {
      request({
        url: 'https://github.com/login/oauth/access_token',
        form: {
          'client_id' : configs.github.client_id,
          'client_secret': configs.github.client_secret,
          'code': code,
          'redirect_uri': configs.github.redirect_uri.full,
          'state': configs.github.state
        },
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      }, (err, httpResponse, body) => {
        if (err) reject(err)
        else resolve(JSON.parse(body))
      })
    })
  }

  getUser(token) {
    return new Promise((resolve, reject) => {
      request({
        url: `https://api.github.com/user?access_token=${token}`,
        headers: {
          'User-Agent': 'gh-x9'
        }
      }, (err, r, responseBody) => {
        if (err) reject(err)
        else resolve(JSON.parse(responseBody))
      })
    })
  }

  getForks(user, repo) {
    return new Promise((resolve, reject) => {
      this.api.repos.getForks({ user, repo }, (err, res) => {
        if (err) reject(err)
        else resolve(res)
      })  
    })
  }

  getCommits(user, repo) {
    return new Promise((resolve, reject) => {
      this.api.repos.getCommits({ user, repo }, (err, res) => {
        if (err) reject(err)
        else resolve(res)
      })
    })
  }
}