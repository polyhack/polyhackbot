const couchCheck = require('./couch-check')

function npmau (options) {
  var bot

  function status (asked) {
    if (!bot)
      return

    couchCheck(options.username, options.password, options.url, function (err, data) {
      if (err)
        return bot.say(options.statusChannel, 'Error checking ' + options.name + ': ' + err)

      if (!data || data.length !== 1 || typeof data[0].progress != 'number')
        return bot.say(options.statusChannel, 'Strange response from ' + options.name + ': ' + JSON.stringify(data))

      if (asked === true || data[0].progress != 100)
        return bot.say(options.statusChannel, 'Replication status of ' + options.name + ': ' + data[0].progress + '%')
    })
  }

  function start (_bot) {
    bot = _bot
    setInterval(status, options.checkInterval)
  }

  return {
      start  : start
    , status : status
  }
}

module.exports = npmau

/* data looks something like this:
[ { pid: '<0.7284.0>',
    checkpointed_source_seq: 900114,
    continuous: true,
    doc_id: 'npm',
    doc_write_failures: 0,
    docs_read: 28,
    docs_written: 28,
    missing_revisions_found: 28,
    progress: 100,
    replication_id: 'b151b6e80be2ffceb221602000cbcd6c+continuous',
    revisions_checked: 93298,
    source: 'http://isaacs.iriscouch.com/registry/',
    source_seq: 900114,
    started_on: 1389921722,
    target: 'registry',
    type: 'replication',
    updated_on: 1389923191 } ]
*/