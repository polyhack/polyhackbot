const NTwitter = require('ntwitter')

var twit

function init (settings) {
  twit = new NTwitter(settings)

  twit.verifyCredentials(function (err, data) {
    if (err) {
      console.error('COULD NOT VERIFY TWITTER CREDENTIALS', err)
      return process.exit(-1)
    }
    console.log('Verified Twitter credentials:', JSON.stringify(data))
  })
}

function tweet (status, cb) {
  // twit.updateStatus() uses the wrong URL, needs trailling slash, so do it manually
  var url    = '/statuses/update.json/'
    , params = {
        status: status.substring(0, 139),
        include_entities: 1
      }
  twit.post(url, params, null, cb);
}

function onTweet (options, message) {
  if (message.user == options.nick)
    return
  if (options.users.indexOf(message.user) == -1) {
    return message.say(
        message.user
      + ': Sorry, I don\'t have you in my list of users! Add yourself here: '
      + options.optionsUrl
    )
  }

  var txt = message.text[0].replace(/^!tweet /, '')
  console.log('tweeting:', txt)
  tweet(txt, function (err) {
    if (err)
      return message.say(message.user + ': Error sending tweet: ' + err)
    message.say(message.user + ': Tweeterfied! <https://twitter.com/polyhackbot>')
  })
}

module.exports.init    = init
module.exports.onTweet = onTweet