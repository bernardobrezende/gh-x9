'use strict'

// TO-DO: remover o uso do String.format quando aderirmos ES2015 no front.
// Fonte: http://stackoverflow.com/a/4673436/5194966
if (!String.format) {

  String.format = function(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
    })
  }

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = String.format
  }

}
