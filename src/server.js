'use strict'

const
  express           = require('express')
, cookieParser      = require('cookie-parser')
, configs           = require('./common/Configurations')
, open 		          = require('open')
// TO-DO: carregar dinâmicamente em um array estes controllers
, IndexController   = require('./controllers/index_controller').IndexController
, CommitController  = require('./controllers/commit_controller').CommitController
, AuthController    = require('./controllers/auth_controller').AuthController

console.log('===== CONFIGURATIONS =====')
console.log(configs)

let appServer = express()

appServer.use(cookieParser())
appServer.use(express.static('./web'))
appServer.use(express.static('./common'))
appServer.use('/', new IndexController().router)
appServer.use('/commit', new CommitController().router)
appServer.use('/auth', new AuthController().router)

appServer.listen(process.env.PORT || configs.server.port || 3000, function () {
  console.log('GH-X9 running under %s', configs.server.base_url)
  open(configs.server.base_url)
});