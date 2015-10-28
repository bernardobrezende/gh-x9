'use strict';

module.exports = (function() {

  var GitHubApi = require('github')
  , async = require('async')
  , str = require('./common/String');

  var github = new GitHubApi({
    version: "3.0.0",
    timeout: 10000
  });

  github.authenticate({
    type: 'oauth',
    token: 'a557e81bbc0df867107d3b77aca6f90b2564f13f'
  });

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

          //console.log(forkAluno);

          var diff = new Date() - new Date(forkAluno.pushed_at);
          var inSeconds = Math.ceil(diff / 1000);
          var inMinutes = Math.ceil(inSeconds / 60);
          var inHours = Math.ceil(inMinutes / 60);
          var inDays = Math.ceil(inHours / 24);
          var ultimoCommit = '';

          if (inHours > 24) {
            ultimoCommit = String.format("{0} dias atrás", inDays);
          } else if (inMinutes > 60) {
            ultimoCommit = String.format("{0} hrs atrás", inHours);
          } else if (inMinutes < 60) {
            ultimoCommit = String.format("{0} min atrás", inMinutes);
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
                    }
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
