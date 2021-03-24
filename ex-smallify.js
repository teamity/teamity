const Smallify = require('smallify')
const Teamity = require('./index')

const smallifyTeamity = function (smallify, opts, done) {
  const { $options } = smallify
  const teamity = Teamity({
    server: {
      server: smallify.$server
    },
    pino: $options.pino
  })

  smallify.addHook('onClose', function () {
    teamity.close()
  })

  smallify.decorate('$teamity', teamity)
  teamity.decorate('$smallify', smallify)
  teamity.ready(done)
}

const smallify = Smallify({
  pino: {
    level: 'info',
    prettyPrint: true
  }
})

smallify.register(smallifyTeamity, {})

smallify.ready(err => {
  err && smallify.$log.error(err)
  // smallify.print()
  smallify.$teamity.print()
  // smallify.close()

  const Websocket = require('ws')
  const ws = new Websocket('ws://127.0.0.1:4880/teamity')

  ws.on('open', function () {
    console.log('ws opend')
  })

  ws.on('error', e => {
    console.log(e)
  })
})
