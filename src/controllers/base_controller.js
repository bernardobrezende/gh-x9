'use strict'

const fs = require('fs')
const  _writeHead = function(res, type, status = 200) {
  res.writeHead(status, { 'Content-Type': `${type}; charset=utf-8` })
}

exports.BaseController = class BaseController {

  constructor() {
    this.MIME_TYPE_HTML = 'text/html'
    this.MIME_TYPE_JSON = 'application/json'
  }

  createJSONError(require_login, message, code = 500) {
    return JSON.stringify({ require_login, message, code })
  }

  writeOkForHtml(res) {
    _writeHead(res, this.MIME_TYPE_HTML)
  }

  writeOkForJson(res) {
    _writeHead(res, this.MIME_TYPE_JSON)
  }

  writeErrorForJson(res) {
    _writeHead(res, this.MIME_TYPE_JSON, 401)
  }

  sendView(req, res, viewName) {
    fs.readFile(viewName, function (err, html) {
      if (err) {
        throw err
      }
      this.writeOkForHtml(res)
      res.write(html)
      res.end()
    }.bind(this))
  }

}
