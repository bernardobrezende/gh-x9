'use strict';

module.exports = (function() {

  var GitHubApi = require('github')
  , async = require('async')
  , github = new GitHubApi({
    version: "3.0.0",
    timeout: 10000
  });
  require('./common/String');

  github.authenticate({
    type: 'basic',
    username: 'gh-x9',
    password: '123456789@a'
  });

  var getDateDiffToNow = function(otherDate) {

    var diff = new Date() - otherDate
    , secs = Math.ceil(diff / 1000)
    , mins = Math.ceil(secs / 60)
    , hours = Math.ceil(mins / 60)
    , days = Math.ceil(hours / 24);

    return {
      inSeconds: secs,
      inMinutes: mins,
      inHours: hours,
      inDays: days
    };

  };

  var fetchGHApi = function(cb) {
    if (typeof cb !== 'function') {
      throw 'Invalid callback: ' + cb;
    }

    var CRESCER_REPO_NAME = 'crescer-2015-2';

    github.repos.getForks(
      { "user": "cwisoftware", repo: CRESCER_REPO_NAME },
      function(err, res) {

        var commitsRequests = [];
        if (err) console.error('error getForks: ' + err);
        if (typeof res === 'undefined') cb([]);

        res.sort(function(a, b) {
          return new Date(b.pushed_at) - new Date(a.pushed_at);
        });
        res.forEach(function(forkAluno) {

          var diff = getDateDiffToNow(new Date(forkAluno.pushed_at));
          var ultimoCommit = '';

          if (diff.inHours > 24) {
            ultimoCommit = String.format("{0} dias atrás", diff.inDays);
          } else if (diff.inMinutes > 60) {
            ultimoCommit = String.format("{0} hrs atrás", diff.inHours);
          } else if (diff.inMinutes < 60) {
            ultimoCommit = String.format("{0} min atrás", diff.inMinutes);
          }

          (function() {
            commitsRequests.push(
              function(callb) {
                github.repos.getCommits({ user: forkAluno.owner.login, repo: CRESCER_REPO_NAME }, function(err, commits) {
                  var activity = {
                    avatar_url: forkAluno.owner.avatar_url,
                    url_fork: forkAluno.html_url,
                    usuario: forkAluno.owner.login,
                    ultimo_commit: {
                      timestamp: ultimoCommit,
                      mensagem: commits[0].commit.message,
                      url: commits[0].html_url
                    },
                    idle: diff.inHours > 24
                  };
                  callb(null, activity);
                });
              }
            );
          })();
        });
        
        async.parallel(commitsRequests, function(err, data) {
          cb(data);
        })
      }
    );
  };

  return { fetch: fetchGHApi };

})();
