const { Server } = require('ws')
const { kTeamityServer, kTeamitySockets, kTeamityRooms } = require('../symbols')
const { onWsComing } = require('../router')
const { parseUrl } = require('../utils')
const queryString = require('querystring')

function printServerInfo () {
  const { $log, $server } = this

  const {
    options: { server: httpServer, host, port, path }
  } = $server
  let address = ''
  if (httpServer) {
    const _addr = httpServer.address()
    if (typeof _addr === 'string') {
      address = `${_addr}${path}`
    } else {
      address = `ws://${_addr.address}:${_addr.port}${path}`
    }
  } else {
    address = `ws://${host}:${port}${path}`
  }

  $log.info('teamity server listening at ' + address)
}

module.exports = function (teamity, opts, done) {
  const { $log } = teamity
  const originVerifyClient = opts.verifyClient

  opts.noServer = false
  opts.verifyClient = (info, done) => {
    const { url } = info.req
    const { pathname, query } = parseUrl(url)

    info.req.pathname = pathname
    info.req.query = queryString.parse(query)

    if (originVerifyClient) {
      originVerifyClient.call(teamity, info, done)
    } else {
      done(true)
    }
  }

  const server = new Server(opts)

  teamity[kTeamityServer] = server
  teamity[kTeamitySockets] = {}
  teamity[kTeamityRooms] = {}

  teamity.addHook('onClose', function () {
    $log.info('teamity server closing...')
    server.close()
  })

  server.on('connection', onWsComing.bind(teamity))

  printServerInfo.call(teamity)
  done()
}
