'use strict';

module.exports = {
  difference: function(dateStart, dateEnd) {
    var diff = dateEnd - dateStart
    , secs = Math.floor(diff / 1000)
    , mins = Math.floor(secs / 60)
    , hours = Math.floor(mins / 60)
    , days = Math.floor(hours / 24);

    return {
      inSeconds: secs,
      inMinutes: mins,
      inHours: hours,
      inDays: days
    };
  }
};
