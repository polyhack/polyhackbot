const jerk    = require('jerk')
    , bogan   = require('boganipsum')
    , delayed = require('delayed').delayed
    , xtend   = require('xtend')

    , tweet   = require('./tweet')
    , troller = require('./troller')
    , npm     = require('./npm')
    , secrets = require('./secrets')
    , options = require('./options')
    , npmau   = require('./npm-au')(xtend(options.couch, secrets.couch))

var handlers  = [
        { on: /bogan/i            , fn: onBogan }
      , { on: /^!tweet /          , fn: tweet.onTweet.bind(null, options) }
      , { on: /^.*$/              , fn: troller.bind(null, options) }
      , { on: /polyhack|nodejsau/i, fn: troller.onKeyword.bind(null, options) }
      , { on: /^!npmau/           , fn: npmau.status.bind(null, true) }
    ]

function onBogan (message) {
  message.say(bogan({ paragraphs: 1, sentenceMax: 5, sentenceMin: 2 }))
}

options.onConnect = delayed(function () {
  // wrong password.. ugh..
  // bot.say('NickServ', 'identify ' + secrets.ircPassword)
  npm.init(bot)
  npmau.start(bot)
}, 7)

var bot = jerk(function (j) {
  handlers.forEach(function (handler) {
    j.watch_for(handler.on, handler.fn)
  })
}).connect(options)

tweet.init(secrets.ntwitter)