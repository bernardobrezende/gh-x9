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
    type: 'oauth',
    token: 'a557e81bbc0df867107d3b77aca6f90b2564f13f'
  });

  var getDateDiffToNow = function(otherDate) {

    var diff = new Date() - otherDate
    , secs = Math.floor(diff / 1000)
    , mins = Math.floor(secs / 60)
    , hours = Math.floor(mins / 60)
    , days = Math.floor(hours / 24);

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

    var CRESCER_REPO_NAME = 'crescer-2016-1';

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

          console.log(forkAluno.owner.login, diff);

          if (diff.inDays > 1) {
            ultimoCommit = String.format("{0} dias atrás", diff.inDays);
          } else if (diff.inDays === 1 ) {
            ultimoCommit = String.format("1 dia atrás");
          } else if (diff.inMinutes > 100) { // 01:40
            ultimoCommit = String.format("{0} hrs atrás", diff.inHours);
          } else if (diff.inMinutes > 40) { // 00:40
            ultimoCommit = "1 hr atrás";
          } else {
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
