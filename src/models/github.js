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