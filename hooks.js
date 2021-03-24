const flows = require('./flows')
const { isArrow } = require('extra-function')
const { HookCallbackError } = require('./errors')
const {
  kTeamityFullname,
  kTeamityLevel,
  kTeamityChildren,
  kHookLevel,
  kTeamityParent,
  kRouteScope,
  kRouteReply
} = require('./symbols')

const routeHooks = ['onBeforeHandler']

const scopeHooks = ['onClose', 'onError', 'onRoute']

const hooks = {}

function noop () {}

function printError (e) {
  this.$log.error(e)
}

function addHook (name, fn) {
  if (typeof fn !== 'function') {
    return this
  }

  if (isArrow(fn)) {
    const e = new HookCallbackError()
    runHooks.call(this, 'onError', this, null, e)
    return this
  }

  if (fn[kHookLevel] === undefined) {
    fn[kHookLevel] = this[kTeamityLevel]
  }
  const children = this[kTeamityChildren]
  const fullname = this[kTeamityFullname]
  const hName = `${fullname}.${name}`

  if (!(hName in hooks)) {
    hooks[hName] = []
  }

  for (const c of children) {
    c.addHook(name, fn)
  }

  hooks[hName].push(fn)
  hooks[hName] = hooks[hName].sort((a, b) => {
    return a[kHookLevel] - b[kHookLevel]
  })

  return this
}

function runHooks (name, ins, done, ...args) {
  done = done || noop

  const fullname = this[kTeamityFullname]
  const hName = `${fullname}.${name}`

  if (!(hName in hooks)) {
    return done()
  }

  const doHooks = [...hooks[hName]]
  if (ins && name in ins) {
    const insHook = ins[name]
    if (typeof insHook === 'function') {
      doHooks.push(insHook)
    }
  }

  if (doHooks.length === 0) {
    return done()
  }

  let doCount = 0
  flows.whilst(
    function (next) {
      next(null, doCount < doHooks.length)
    },
    function (next) {
      function doNext (e) {
        doCount++
        next(e)
      }
      try {
        const doHook = doHooks[doCount]
        const pLike = doHook.call(ins, ...args)
        if (pLike && typeof pLike.then === 'function') {
          pLike.then(() => doNext()).catch(e => doNext(e))
        } else {
          doNext()
        }
      } catch (e) {
        doNext(e)
      }
    },
    done
  )
}

function initHooks () {
  this.addHook = addHook.bind(this)

  const parent = this[kTeamityParent]

  if (!parent) {
    return
  }

  const hookNames = [...scopeHooks, ...routeHooks]
  const fullname = this[kTeamityFullname]
  const parentFullname = parent[kTeamityFullname]

  for (const hName of hookNames) {
    const parentHook = hooks[`${parentFullname}.${hName}`]
    if (Array.isArray(parentHook)) {
      hooks[`${fullname}.${hName}`] = [...parentHook]
    }
  }
}

function attachHooks () {
  this._onClose((ins, done) => {
    runHooks.call(ins, 'onClose', ins, done)
  })
  this.addHook('onError', printError)
}

function throwError (ins, e) {
  runHooks.call(ins, 'onError', ins, null, e)
}

function onRouteFlow (next) {
  const { $teamity } = this
  runHooks.call($teamity, 'onRoute', $teamity, next, this)
}

function generalLifecycle (hookName) {
  return function (next) {
    const { $teamity } = this
    const scope = this[kRouteScope]
    const rep = this[kRouteReply]
    runHooks.call($teamity, hookName, this, next, scope, rep)
  }
}

module.exports = {
  initHooks,
  attachHooks,
  routeHooks,
  scopeHooks,
  throwError,

  onRouteFlow,

  onBeforeHandlerFlow: generalLifecycle('onBeforeHandler')
}
