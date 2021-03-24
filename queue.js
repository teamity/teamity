const {
  kQueueRoutes,
  kQueueReplies,

  kRouteTeamity,
  kTeamityRouterPrefix,
  kTeamityRoutes,
  kTeamityChildren
} = require('./symbols')

const { RouteOptionsError, HookCallbackError } = require('./errors')

const { Route } = require('./route')
const { initRouteProperties } = require('./properties')
const { routeHooks, throwError, onRouteFlow } = require('./hooks')
const { addRouteFlow } = require('./router')
const { isArrow } = require('extra-function')
const { buildAjvErrorsMsg } = require('./utils')

const FastQ = require('fastq')
const flows = require('./flows')
const { default: AJV } = require('ajv')

const ajv = new AJV({ useDefaults: true, coerceTypes: true })

function noop () {}

function activeQueue (name) {
  return new Promise(resolve => {
    const children = this[kTeamityChildren]
    const queue = this[name]
    queue.drain = async () => {
      for (const child of children) {
        await activeQueue.call(child, name)
      }
      resolve()
      queue.drain = noop
    }
    queue.resume()
  })
}

function routerWorker (route, done) {
  flows.series(route, [onRouteFlow, addRouteFlow], e => {
    if (e) {
      throwError(this, e)
    } else {
      this[kTeamityRoutes].push(`${route.method} ${route.url}`)
      done()
    }
  })
}

// function replyWorker (reply, done) {
//   const { sockets, topic, body } = reply
//   console.log({
//     body,
//     topic,
//     sockets: sockets.map(s => s.$id)
//   })
//   done()
// }

function attachAvvio () {
  const { $avvio, $log } = this.$root

  $avvio._readyQ.unshift(async () => {
    $avvio._readyQ.pause()
    $log.debug('register routes')
    await activeQueue.call(this.$root, kQueueRoutes)
    await activeQueue.call(this.$root, kQueueReplies)

    $avvio._readyQ.resume()
  })
}

function initQueue () {
  this[kQueueRoutes] = FastQ(this, routerWorker, 1)
  this[kQueueRoutes].pause()

  const { onWsSending } = require('./router')
  this[kQueueReplies] = FastQ(this, onWsSending, 1)
  this[kQueueReplies].pause()
}

function addRoute (opts, handler) {
  const schema = require('./schemas/route-options.json')
  ajv.compile(schema)(opts)
  if (!ajv.validate(schema, opts)) {
    const e = new RouteOptionsError(buildAjvErrorsMsg(ajv.errors))
    return throwError(this, e)
  }

  const route = new Route(opts)
  route[kRouteTeamity] = this
  initRouteProperties.call(route)

  if (!route.handler && typeof handler === 'function') {
    route.handler = handler
  }

  if (typeof route.handler !== 'function') {
    const e = new RouteOptionsError(
      `missing handler function for ${route.url} route`
    )
    return throwError(this, e)
  }

  if (isArrow(route.handler)) {
    const e = new RouteOptionsError(
      `handler for ${route.url} route not allow arrow function`
    )
    return throwError(this, e)
  }

  for (const hk of routeHooks) {
    if (hk in route) {
      if (typeof route[hk] !== 'function') {
        route[hk] = noop
        break
      }

      if (isArrow(route[hk])) {
        const e = new HookCallbackError()
        return throwError(this, e)
      }
    }
  }

  const prefix = this[kTeamityRouterPrefix]

  if (route.$usePrefix && prefix && prefix !== '') {
    route.url = `${prefix}${route.url}`
  }

  this[kQueueRoutes].push(route)
}

module.exports = {
  initQueue,
  attachAvvio,
  addRoute
}
