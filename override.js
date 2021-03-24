const {
  kTeamityName,
  kTeamityFullname,
  kTeamityLevel,
  kTeamityDecorates,
  kTeamityRoutes,
  kTeamityChildren,
  kTeamityRouterPrefix,
  kTeamityParent,
  kTeamityReply,

  kTeamityPluginMeta
} = require('./symbols')

const { PluginVersioMismatchError } = require('./errors')
const { initQueue } = require('./queue')
const { initHooks } = require('./hooks')

const Merge = require('merge')
const Semver = require('semver')

function initScope () {
  const parent = this[kTeamityParent]
  if (parent) {
    // root scope parent==null
    this[kTeamityReply] = Object.create(parent[kTeamityReply])
  }

  this[kTeamityDecorates] = []
  this[kTeamityRoutes] = []
  this[kTeamityChildren] = []
}

function avvioOverride (old, fn, opts) {
  const meta = fn[kTeamityPluginMeta]

  // merge options
  Merge.recursive(opts, meta || {})

  if (!opts.name) {
    return old
  }

  // check version
  if (opts.teamity && !Semver.satisfies(old.$version, opts.teamity)) {
    throw new PluginVersioMismatchError(opts.name, opts.teamity, old.$version)
  }

  const ins = Object.create(old)
  old[kTeamityChildren].push(ins)

  ins[kTeamityParent] = old
  ins[kTeamityName] = opts.name
  ins[kTeamityLevel] = old[kTeamityLevel] + 1
  ins[kTeamityFullname] = `${old[kTeamityFullname]}.${opts.name}`
  ins[kTeamityRouterPrefix] = buildRouterPrefix(
    old[kTeamityRouterPrefix],
    opts.prefix
  )

  initScope.call(ins)
  initHooks.call(ins)
  initQueue.call(ins)

  return ins
}

function buildRouterPrefix (iPrefix, pPrefix) {
  if (!pPrefix || pPrefix === '') {
    return iPrefix
  }

  if (iPrefix === '') {
    return pPrefix || ''
  }

  return `${iPrefix}${pPrefix}`
}

module.exports = {
  avvioOverride,
  initScope
}
