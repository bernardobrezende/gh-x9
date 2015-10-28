'use strict';

module.exports = (function() {

  var GitHubApi = require('github')
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
    github.repos.getForks(
      { "user": "cwisoftware", repo: "crescer-2015-2" },
      function(err, res) {

        var commits = [];
        if (err) console.error('error getForks: ' + err);
        if (typeof res === 'undefined') cb(commits);;

        res.sort(function(a, b) {
          return new Date(b.pushed_at) - new Date(a.pushed_at);
        });
        res.forEach(function(forkAluno) {

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

          commits.push({ avatar_url: forkAluno.owner.avatar_url, url_fork: forkAluno.html_url, usuario: forkAluno.owner.login, ultimo_commit: ultimoCommit });

        });

        cb(commits);
      }
    );
  };

  return { fetch: fetchGHApi };

})();
