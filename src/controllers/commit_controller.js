'use strict'

const GitHub            = require('../models/github').GitHub
  , date                = require('../common/Date')
  , ghx9rc              = require('../common/gh-x9rc')
  , StringExtensions    = require('../common/String')
  , express             = require('express')

const _createErrorJSON = (error, require_login, code = 500, message) => {
  return JSON.stringify({ error, require_login, code, message })
}

exports.CommitController = class CommitController {
  
  constructor() {
    this.github = new GitHub()
    this.CRESCER_REPO_NAME = ghx9rc.main_repository || 'crescer-2016-1'
    this.router = express.Router()
    this.router.get('/', (req, res) => this.get(req, res))
  }

  // Actions
  get(req, res) {
    // TODO: criar método facade pra isso
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    // TODO: extrair o nome deste cookie para constante
    var token = req.cookies['gh-x9-v2-auth'];
    if(!!token) {
      this.github.getUser(token).then(l => {
        if (ghx9rc.allowed_users.indexOf(l.login) === -1) {
          return res.end(_createErrorJSON(true, true, 401, 'Efetue o login para continuar.'))
        }
        this.github.authenticate(token)
        this.fetch()
          .then(r => {
            res.end(JSON.stringify(r));
          })
          .catch(error => {
            console.error(error)
            res.end(_createErrorJSON(true, error.code === 401, error.code, error.message))
          })
      })
    }
    else {
      res.end(_createErrorJSON(true, true, 401, 'Efetue o login para continuar.'))
    }
  }

  fetch() {

    // TODO: mover para models
    function sortByPushedDate(forks) {
      forks.sort(function(a, b) {
        return new Date(b.pushed_at) - new Date(a.pushed_at);
      });
    };

    function buildCommitStats(commits) {
      var stats = {
        feat: 0,
        fix: 0,
        refactor: 0,
        merge: 0,
        test: 0
      };

      commits.forEach(function(c) {
        for (var prop in stats) {
          if (c.commit.message.toLowerCase().indexOf(prop) > -1) {
            stats[prop]++;
          }
        }
      });

      stats.all = commits.length;

      return stats;
    };

    function buildActivity(fork, commits) {
      var timestamp = date.difference(new Date(fork.pushed_at), new Date());

      return {
        avatar_url: fork.owner.avatar_url,
        url_fork: fork.html_url,
        user: fork.owner.login,
        warning: timestamp.inDays > 0,
        pushed_date: new Date(fork.pushed_at),
        pushed_timestamp: timestamp,
        commits_stats: buildCommitStats(commits),
        last_commits: [
          {
            message: commits[0].commit.message,
            url: commits[0].html_url
          },
          {
            message: commits[1].commit.message,
            url: commits[1].html_url
          },
          {
            message: commits[2].commit.message,
            url: commits[2].html_url
          }
        ]
      };
    };

    return new Promise((resolve, reject) => {
      const self = this
      this.github.getForks('cwisoftware', this.CRESCER_REPO_NAME).then(res => {
        if (typeof res === 'undefined') {
          return resolve([])
        }

        sortByPushedDate(res)
        // remove ignored users
        res = res.filter(function(fork) {
          return ghx9rc.ignore_users.join(',').indexOf(fork.owner.login) === -1 ? fork : undefined;
        })
        
        let commitsRequests = res.map(f => self.github.getCommits(f.owner.login, self.CRESCER_REPO_NAME))

        Promise.all(commitsRequests).then(values => {
          // res => array de todos os forks
          // values => array de arrays, cada posição é o array de commits
          // batemos pelo índice para vincular o fork aos commits
          // ex: values[0] são os commits do fork res[0]
          resolve(res.map((v,i) => buildActivity(v, values[i])))
        })
      })
      .catch(err => reject(err))
    })
  }
}
