const MIN_STARTS  = 5
    , MAX_LENGTH  = 250
    , WISDOM_PROBABILITY = 0.4 // 30% chance of random wisdom from the bot rather than your own words back

var EchoMunge     = require('echomunge')
  , echomungeWeb  = require('echomunge-web')

  , databases     = {}

  , dbForUser     = function (nick) {
      return databases['$' + nick] || (databases['$' + nick] = new EchoMunge())
    }

  , logForUser    = function (nick, msg) {
      dbForUser(nick).recordSentence(msg)
    }

  , enoughForUser = function (nick) {
      return dbForUser(nick).starts.length > MIN_STARTS
    }

  , trollForUser  = function (nick, callback) {
      var ret = function (err, db, urls) {
        if (urls) console.log('fetched from web:',urls)
        callback(null, db.makeText({ maxLength: MAX_LENGTH, terminate: true }))
      }

      if (enoughForUser(nick) && Math.random() > WISDOM_PROBABILITY)
        ret(null, dbForUser(nick))
      else
        echomungeWeb(null, ret)
    }

module.exports.log   = logForUser
module.exports.troll = trollForUser