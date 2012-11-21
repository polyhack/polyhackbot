var Jerk     = require( 'jerk' )
  , bogan    = require('boganipsum')
  , NTwitter = require('ntwitter')
  , options  = require('./options')
  , twit
  , jerk

  , tweet = function (status, cb) {
      // twit.updateStatus() uses the wrong URL, needs trailling slash, so do it manually
      var url = '/statuses/update.json/'
        , params = {
            status: status.substring(0, 139),
            include_entities: 1
          }
      twit.post(url, params, null, cb);
    }

  , handlers = [
        {   on: /bogan/i
          , fn: function (message) {
              message.say(bogan({ paragraphs: 1, sentenceMax: 5, sentenceMin: 2 }))
            }
        }
      , {   on: /^!tweet /
          , fn: function (message) {
              if (options.users.indexOf(message.user) == -1)
                return message.say(message.user + ': Sorry, I don\'t have you in my list of users! Add yourself here: ' + options.optionsUrl)

              var txt = message.text[0].replace(/^!tweet /, '')
              console.log('tweeting:', txt)
              tweet(txt, function (err) {
                if (err)
                  return message.say(message.user + ': Error sending tweet: ' + err)
                message.say(message.user + ': Tweeterfied! <https://twitter.com/polyhackbot>')
              })
            }
        }
    ]

  , start = function (secrets) {
      twit = new NTwitter(secrets.ntwitter)

      twit.verifyCredentials(function (err, data) {
        if (err) {
          console.err('COULD NOT VERIFY TWITTER CREDENTIALS', err)
          return process.exit(-1)
        }
        console.log('Verified Twitter credentials:', JSON.stringify(data))
      })

      options.onConnect = function () {
        setTimeout(jerk.say.bind(jerk, 'NickServ', 'identify ' + secrets.ircPassword), 5000)
      }

      jerk = Jerk(function (j) {
        handlers.forEach(function (handler) {
          j.watch_for(handler.on, handler.fn)
        })
      }).connect(options)
    }

module.exports = start