'use strict';

module.exports = (function() {

  var CRESCER_REPO_NAME = 'crescer-2015-2';

  var GitHubApi = require('github')
        , async = require('async')
        , date = require('./common/Date');

  var github = new GitHubApi({
    version: "3.0.0",
    timeout: 10000
  });

  github.authenticate({
    type: 'oauth',
    token: '123'
  });

  var fetchGHApi = function(onSuccess, onError) {
    if (typeof onSuccess !== 'function') {
      throw 'Invalid callback: ' + onSuccess;
    }

    getForks(function(err, res) {
        var commitsRequests = [];

        if (err) {
          console.error('error getForks: ' + err);
          onError(err);
          return;
        }

        if (typeof res === 'undefined') {
          onSuccess([]);
          return;
        }

        sortByPushedDate(res);

        res.forEach(function(fork) {
          (function() {
            commitsRequests.push(
              function(onSuccess) {
                getCommits(fork, onSuccess, function(err){
                  console.error('error getCommits: ' + err);
                  onError(err);
                  return;
                });
              }
            );
          })();
        });

        async.parallel(commitsRequests, function(err, data) {
          if(err) {
            console.log('error async.parallel: ' + err);
            onError(err);
            return;
          }
          onSuccess(data);
        })
      }
    );
  };

  function getCommits(fork, onSuccess, onError) {
    var params = { user: fork.owner.login, repo: CRESCER_REPO_NAME };
    github.repos.getCommits(params, function(err, commits) {
      if(err) {
        console.error('error getCommits: ' + err);
        onError(err);
        return;
      }

      var activity = buildActivity(fork, commits);
      onSuccess(null, activity);
    });
  };

  function sortByPushedDate(forks) {
    forks.sort(function(a, b) {
      return new Date(b.pushed_at) - new Date(a.pushed_at);
    });
  };

  function getForks(callBack) {
    github.repos.getForks(
      { "user": "cwisoftware", repo: CRESCER_REPO_NAME },
      callBack);
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


  return { fetch: fetchGHApi };

})();
