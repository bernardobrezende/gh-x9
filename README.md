## GitHub X9 - Fork scouting

### Install

`$ npm install`  
`$ bower install`

### Configure
1 - Register a new application on [github](https://github.com/settings/applications/new).
  * `Application Name`: chose a name.
  * `Homepage URL`: the url of your application (Ex: `http://localhost:3000`).
  * `Application description`: type a description.
  * `Authorization callback URL`: your Homepage URL + `/auth/github/callback` (Ex: `http://localhost:3000/auth/github/callback`)

2 - Create the following environment variables:
  * `GH_X9_PORT`: the server port (Same port of your application, Ex: `3000` for `http://localhost:3000`).
  * `GH_X9_URL`: the server url (same of `Homepage URL` of step 1: `http://localhost:3000` for this example).
  * `GH_X9_CLIENT_ID`: the github client id from app created on step 1.
  * `GH_X9_CLIENT_SECRET`: the github client secret from app created on step 1.
  * `GH_X9_STATE`: a random string.

### Run
Open two CMD window, then:

CMD Window 1:
* `$ gulp`

CMD Window 2:
* `$ npm start`  
