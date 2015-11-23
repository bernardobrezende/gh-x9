## GitHub X9 - Fork scouting

### Install

`$ npm install`  
`$ bower install`

### Configure
1 - Register a new application on [github](https://github.com/settings/applications/new).

2 - Create the following environment variables:
  * `GH_X9_PORT`: the server port (Ex: `3000`).
  * `GH_X9_URL`: the server url (Ex: `http://localhost:3000`).
  * `GH_X9_CLIENT_ID`: the github client id from app created on step 1.
  * `GH_X9_CLIENT_SECRET`: the github client secret from app created on step 1.
  * `GH_X9_STATE`: a random string.

### Run
Open two CMD window, then:

CMD Window 1:
* `$ gulp`

CMD Window 2:
* `$ cd src`  
* `$ node github-crescer-server`  
