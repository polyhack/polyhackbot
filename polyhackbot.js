const jerk             = require('jerk')
    , bogan            = require('boganipsum')
    , delayed          = require('delayed').delayed

    , tweet            = require('./tweet')
    , troller          = require('./troller')
    , npm              = require('./npm')
    , secrets          = require('./secrets')
    , options          = require('./options')

var handlers  = [
        { on: /bogan/i            , fn: onBogan }
      , { on: /^!tweet /          , fn: tweet.onTweet.bind(null, options) }
      , { on: /^.*$/              , fn: troller.bind(null, options) }
      , { on: /polyhack|nodejsau/i, fn: troller.onKeyword.bind(null, options) }
    ]

function onBogan (message) {
  message.say(bogan({ paragraphs: 1, sentenceMax: 5, sentenceMin: 2 }))
}

options.onConnect = delayed(function () {
  // wrong password.. ugh..
  // bot.say('NickServ', 'identify ' + secrets.ircPassword)
  npm.init(bot)
}, 7)

var bot = jerk(function (j) {
  handlers.forEach(function (handler) {
    j.watch_for(handler.on, handler.fn)
  })
}).connect(options)

tweet.init(secrets.ntwitter)