const TrekRouter = require('trek-router')
const flows = require('./flows')

const {
  kTeamitySockets,
  kTeamityReply,
  kTeamityParser,
  kTeamitySerializer,

  kSocketTeamity,

  kRouteScope,
  kRouteSocket,
  kRouteParent,
  kRouteReply,

  kReplyRoute,

  kScopeBody
} = require('./symbols')
const { RouteExistsError } = require('./errors')
const { Socket } = require('./socket')
const { Route } = require('./route')
const { Scope } = require('./scope')
const { initReply } = require('./reply')
const { throwError, onBeforeHandlerFlow } = require('./hooks')
const { promisify } = require('./utils')

const router = new TrekRouter()
const method = 'TEAMITY'

function addSocket () {
  const teamity = this[kSocketTeamity]
  const sockets = teamity[kTeamitySockets]
  sockets[this.$id] = this
}

function delSocket () {
  const teamity = this[kSocketTeamity]
  const sockets = teamity[kTeamitySockets]
  delete sockets[this.$id]

  this.$raw.close()
}

function recvSocket (topic, body) {
  const findResult = router.find(method, topic)

  if (!(findResult[0] instanceof Route)) {
    return
  }

  const parentRoute = findResult[0]
  const { $teamity } = parentRoute
  const params = {}
  findResult[1].forEach(pm => {
    params[pm.name] = pm.value
  })

  const route = Object.create(parentRoute)

  const rep = Object.create($teamity[kTeamityReply])
  rep[kReplyRoute] = route
  initReply.call(rep, this)

  const scope = new Scope(this, topic, params, body)

  route[kRouteParent] = parentRoute
  route[kRouteScope] = scope
  route[kRouteSocket] = this
  route[kRouteReply] = rep

  flows.series(route, [onBeforeHandlerFlow, onHandlerFlow], err => {
    if (err) {
      throwError($teamity, err)
    }
  })
}

function addRouteFlow (next) {
  const { url, method, $teamity } = this
  const { $log } = $teamity

  const findResult = router.find(method, url)
  if (findResult[0]) {
    return next(new RouteExistsError(url))
  }

  $log.debug(`teamity route:${method} ${url}`)
  router.add(method, url, this)
  next()
}

async function onHandlerFlow (next) {
  const { handler, $teamity } = this
  const scope = this[kRouteScope]
  const rep = this[kRouteReply]

  try {
    const parser = $teamity[kTeamityParser]
    if (typeof parser === 'function') {
      scope[kScopeBody] = await promisify(parser.bind(this), scope[kScopeBody])
    }
    handler.call(this, scope, rep)
  } catch (e) {
    throwError($teamity, e)
  }
  next()
}

function onWsComing (ws, req) {
  const { query } = req
  const skt = new Socket(ws, query)
  skt[kSocketTeamity] = this

  skt.on('close', delSocket)
  skt.on('error', delSocket)
  skt.on('decode', recvSocket)
  addSocket.call(skt)
}

async function onWsSending (rep, done) {
  try {
    const { topic, body, sockets } = rep
    const findResult = router.find(method, topic)

    if (!(findResult[0] instanceof Route)) {
      return
    }

    const parentRoute = findResult[0]
    const { $teamity } = parentRoute
    const route = Object.create(parentRoute)

    const serializer = $teamity[kTeamitySerializer]

    let serBody = body
    if (typeof serializer === 'function') {
      serBody = await promisify(serializer.bind(route), body)
    }

    for (const skt of sockets) {
      skt.send(topic, serBody)
    }
  } catch (e) {
    throwError(this, e)
  }
  done()
}

module.exports = {
  addRouteFlow,
  onWsComing,
  onWsSending
}
