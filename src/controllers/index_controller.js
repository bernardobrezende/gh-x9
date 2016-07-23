'use strict'

const
  express           = require('express')
  , fs              = require('fs')
  , BaseController  = require('./base_controller').BaseController

exports.IndexController = class IndexController extends BaseController {
  
  constructor() {
    super()
    this.router = express.Router()
    this.router.get('/', (req, res) => this.index(req, res))
  }

  // Actions
  index(req, res) {
    super.sendView(req, res, './web/views/home.html')
  }
}
