const through2 = require('through2')

function isMaintainer (maintainers, pkg) {
  if (!pkg || !maintainers.length)
    return false

  var v = pkg['dist-tags'] && pkg['dist-tags'].latest
    , i

  if (v && pkg.versions && pkg.versions[v] && Array.isArray(pkg.versions[v].maintainers)) {
    for (i = 0; i < pkg.versions[v].maintainers.length; i++) {
      if (pkg.versions[v].maintainers[i].name
          && maintainers.indexOf(pkg.versions[v].maintainers[i].name) > -1)
        return true
    }
  }

  return false
}

function npmMaintainerFilterStream () {
  var maintainers = []
    , stream = through2({ objectMode: true }, function (chunk, enc, callback) {
      if (isMaintainer(maintainers, chunk.doc))
        this.push(chunk)
      callback()
    })

  stream.setMaintainers = function (_maintainers) {
    maintainers = _maintainers
  }

  return stream
}

module.exports = npmMaintainerFilterStream