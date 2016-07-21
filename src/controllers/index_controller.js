'use strict'

const
  express = require('express')
  , fs    = require('fs')

// TODO: jogar para uma classe helper (ou controller base)
const _sendView = (viewName, req, res) => {
  fs.readFile(viewName, function (err, html) {
    if (err) {
      throw err
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.write(html)
    res.end()
  })
}

exports.IndexController = class IndexController {
  
  constructor() {
    this.router = express.Router()
    this.router.get('/', (req, res) => this.index(req, res))
  }

  // Actions
  index(req, res) {
    _sendView('./web/views/home.html', req, res)
  }
}
