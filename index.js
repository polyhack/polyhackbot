const TROLL_PROBABILITY = 0.005 // 0.5% chance of being randomly trolled by the bot

var jerk             = require('jerk')
  , bogan            = require('boganipsum')
  , NTwitter         = require('ntwitter')
  , NpmPublishStream = require('npm-publish-stream')
  , NpmMaintainerFilterStream = require('./npm-maintainer-filter-stream')
  , troller          = require('./troller')
  , options          = require('./options')
  , version          = require('./package').version
  , twit
  , bot

  , tweet = function (status, cb) {
      // twit.updateStatus() uses the wrong URL, needs trailling slash, so do it manually
      var url = '/statuses/update.json/'
        , params = {
            status: status.substring(0, 139),
            include_entities: 1
          }
      twit.post(url, params, null, cb);
    }

  , trollHandle = function (message) {
      if (message.user == options.nick) return
      troller.troll(message.user, function (err, msg) {
        message.say(message.user + ': ' + msg)
      })
    }

  , handlers = [
        {   on: /bogan/i
          , fn: function (message) {
              message.say(bogan({ paragraphs: 1, sentenceMax: 5, sentenceMin: 2 }))
            }
        }
      , {   on: /^!tweet /
          , fn: function (message) {
              if (message.user == options.nick) return
              if (options.users.indexOf(message.user) == -1)
                return message.say(
                    message.user
                  + ': Sorry, I don\'t have you in my list of users! Add yourself here: '
                  + options.optionsUrl
                )

              var txt = message.text[0].replace(/^!tweet /, '')
              console.log('tweeting:', txt)
              tweet(txt, function (err) {
                if (err)
                  return message.say(message.user + ': Error sending tweet: ' + err)
                message.say(message.user + ': Tweeterfied! <https://twitter.com/polyhackbot>')
              })
            }
        }
      , {   on: /^.*$/
          , fn: function (message) {
              if (message.user == options.nick) return
              if (Math.random() < TROLL_PROBABILITY) trollHandle.call(this, message)
              troller.log(message.user, message.text[0])
            }
        }
      , {   on: /polyhack|nodejsau/i
          , fn: trollHandle
        }
    ]

  , start = function (secrets, parentVersionString) {
      twit = new NTwitter(secrets.ntwitter)

      twit.verifyCredentials(function (err, data) {
        if (err) {
          console.err('COULD NOT VERIFY TWITTER CREDENTIALS', err)
          return process.exit(-1)
        }
        console.log('Verified Twitter credentials:', JSON.stringify(data))
      })

      options.onConnect = function () {
        setTimeout(function () {
          bot.say('NickServ', 'identify ' + secrets.ircPassword)
          bot.say(
              '#polyhack'
            ,   'Hey peeps! I\'m back, running polyhackbot@'
              + version
              + ' and '
              + (parentVersionString || 'unknown parent')
          )

          new NpmPublishStream()
            .pipe(maintainerFilterStream)
            .on('data', handleNpmData)
            .on('error', console.log)
        }, 5000)
      }

      bot = jerk(function (j) {
        handlers.forEach(function (handler) {
          j.watch_for(handler.on, handler.fn)
        })
      }).connect(options)

      var maintainerFilterStream = new NpmMaintainerFilterStream()
        , setMaintainers = function (maintainers) {
            maintainerFilterStream.setMaintainers(maintainers)
          }
        , handleNpmData = function (data) {
            bot.say(
                '#polyhack'
              ,   '[npm] '
                + data.id + '@' + data.doc['dist-tags'].latest
                + ' <http://npm.im/' + data.id + '>: '
                + (data.doc.description || '')
                + ' (' + data.doc.versions[data.doc['dist-tags'].latest].maintainers
                          .map(function (m) { return '@' + m.name }).join(', ') + ')'
            )
          }

      return {
          setMaintainers: setMaintainers
      }
    }

module.exports = start