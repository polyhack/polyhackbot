const TROLL_PROBABILITY = 0.001 // 0.1% chance of being randomly trolled by the bot
    , MIN_STARTS  = 5
    , MAX_LENGTH  = 250
    , WISDOM_PROBABILITY = 0.3 // 30% chance of random wisdom from the bot rather than your own words back

const EchoMunge    = require('echomunge')
    , echomungeWeb = require('echomunge-web')
    , seriousNerds = require('./serious_nerds').map(function (nerd) {
        return nerd[0] == '/' ? new RegExp(nerd) : nerd
      })

var databases = {}

function dbForUser (nick) {
  return databases['$' + nick] || (databases['$' + nick] = new EchoMunge())
}

function logForUser (nick, msg) {
  dbForUser(nick).recordSentence(msg)
}

function enoughForUser (nick) {
  return dbForUser(nick).starts.length > MIN_STARTS
}

function trollForUser (nick, callback) {
  var ret = function (err, db, urls) {
    if (urls)
      console.log('fetched from web:',urls)
    callback(null, db.makeText({ maxLength: MAX_LENGTH, terminate: true }))
  }

  if (enoughForUser(nick) && Math.random() > WISDOM_PROBABILITY)
    ret(null, dbForUser(nick))
  else
    echomungeWeb(null, ret)
}

function onKeyword (options, message) {
  if (message.user == options.nick || seriousNerds.indexOf(message.user) > -1)
    return

  trollForUser(message.user, function (err, msg) {
    message.say(message.user + ': ' + msg)
  })
}

function channelMessage (options, message) {
  if (message.user == options.nick)
    return
  if (Math.random() < TROLL_PROBABILITY)
    onKeyword(options, message)
  logForUser(message.user, message.text[0])
}

module.exports             = channelMessage
module.exports.onKeyword = onKeyword