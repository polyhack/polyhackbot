const npmMaintainers   = require('npm-maintainers-au')
    , NpmPublishStream = require('npm-publish-stream')
    , NpmMaintainerFilterStream = require('./npm-maintainer-filter-stream')

var maintainerFilterStream = new NpmMaintainerFilterStream()
  , streaming = false

function handleNpmData (data) {
  var desc = (data.doc.description || '')
    , msg

  if (desc.length > 128)
    desc = desc.substring(0, 127) + '…'

  msg = '[npm] '
      + data.id + '@' + data.doc['dist-tags'].latest
      + ' <http://npm.im/' + data.id + '>: '
      + desc
      + ' (' + data.doc.versions[data.doc['dist-tags'].latest].maintainers
                .map(function (m) { return '@' + m.name }).join(', ') + ')'

  this.say('#polyhack', msg)
}

function updateMaintainers () {
  npmMaintainers(function (err, data) {
    if (err)
      return console.log(err)
    if (!data.length)
      return

    data = data.map(function (u) { return u.npmLogin })
    maintainerFilterStream.setMaintainers(data)
  })
}

function init (bot) {
  if (!streaming) {
    new NpmPublishStream()
      .on('error', console.log)
      .pipe(maintainerFilterStream)
      .on('data', handleNpmData.bind(bot))

    streaming = true

    setInterval(updateMaintainers, 1000 * 60 * 60 * 6)
    updateMaintainers()
  }
}

module.exports.init = init