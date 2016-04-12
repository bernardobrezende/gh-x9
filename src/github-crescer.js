'use strict';

module.exports = (function() {

  var CRESCER_REPO_NAME = 'crescer-2016-1';

  var GitHubApi = require('github')
  , async = require('async')
  , date = require('./common/Date')
  , ghx9rc = require('./common/gh-x9rc');

  var github = new GitHubApi({
    version: "3.0.0",
    timeout: 10000
  });

  require('./common/String');

  var authenticate = function(token) {
    github.authenticate({
      type: 'oauth',
      token: token
    });
  };

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

        // remove ignored users
        res = res.filter(function(fork) {
          return ghx9rc.ignore_users.join(',').indexOf(fork.owner.login) === -1 ? fork : undefined;
        });

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


  return {
    authenticate: authenticate,
    fetch: fetchGHApi
  };

})();
