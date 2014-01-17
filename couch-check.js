const hyperquest = require('hyperzip')(require('hyperdirect'))
    , bl         = require('bl')

function check (user, pass, url, callback) {
  hyperquest(url, { auth: user + ':' + pass }).pipe(bl(function (err, data) {
    if (err)
      return callback(err)

    var _data = JSON.parse(data.toString())
    callback(null, _data)
  }))
}

module.exports = check