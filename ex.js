const Teamity = require('./index')

const teamity = Teamity({
  pino: {
    level: 'info',
    prettyPrint: true
  },
  server: {
    host: '127.0.0.1',
    port: 4888,
    verifyClient (info, done) {
      done(true)
    }
  }
})

// teamity.addHook('onRoute', function (route) {
//   console.log({
//     route,
//     self: this
//   })
// })

// teamity.addHook('onBeforeHandler', function () {
//   console.log('onBeforeHandler')
// })

teamity.route({
  url: '/',
  handler (scope, rep) {
    console.log(scope)
  }
})

teamity.route({
  url: '/:test',
  schema: {
    body: {
      type: 'object',
      properties: {
        a: {
          type: 'string'
        }
      }
    },
    params: {
      type: 'object',
      properties: {
        test: {
          type: 'number'
        }
      }
    }
  },
  handler (scope, rep) {
    // if (scope.query.q === '123') {
    //   this.join('c1-room')
    // } else {
    rep.emit('reply from c1-room')
    // }
    // console.log({
    //   headers: scope.headers,
    //   query: scope.query
    // })
  }
})

teamity.ready(async e => {
  e && teamity.$log.error(e.message)
  teamity.print()
  // console.log(teamity)
  // teamity.close()
})
