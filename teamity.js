const {
  kTeamityRoot,
  kTeamityName,
  kTeamityFullname,
  kTeamityLevel,
  kTeamityOptions,
  kTeamityRouterPrefix,
  kTeamityVersion,
  kTeamityAvvio,
  kTeamityDecorates,
  kTeamityParent,
  kTeamityReply,

  kTeamityParser,
  kTeamitySerializer
} = require('./symbols')

const { initTeamityProperties } = require('./properties')
const { attachAvvio, initQueue, addRoute } = require('./queue')
const { attachHooks, initHooks } = require('./hooks')
const { attachParser } = require('./parser')
const { attachSerializer } = require('./serializer')

const teamityOptions = require('./options')
const teamityAvvio = require('avvio')
const { avvioOverride, initScope } = require('./override')
const initTeamityDecorates = require('./decorates')
const initTeamityPlugins = require('./plugins')

const { Reply } = require('./reply')

function Teamity (opts) {
  if (!(this instanceof Teamity)) {
    return new Teamity(opts)
  }

  this[kTeamityRoot] = this
  this[kTeamityName] = 'root'
  this[kTeamityFullname] = 'root'
  this[kTeamityLevel] = 0
  this[kTeamityOptions] = teamityOptions(opts)
  this[kTeamityRouterPrefix] = opts.router.prefix
  this[kTeamityVersion] = require('./package.json').version

  this[kTeamityParent] = null
  this[kTeamityReply] = new Reply()

  initScope.call(this)

  this[kTeamityAvvio] = teamityAvvio(this, {
    expose: {
      use: 'register',
      onClose: '_onClose'
    },
    autostart: true,
    timeout: 15000
  })
  this[kTeamityAvvio].override = avvioOverride

  initTeamityProperties.call(this)
  initTeamityDecorates.call(this)

  initHooks.call(this)
  initQueue.call(this)

  attachParser.call(this)
  attachSerializer.call(this)
  attachHooks.call(this)
  attachAvvio.call(this)

  initTeamityPlugins.call(this)
}

Teamity.prototype.decorate = function (prop, value) {
  if (typeof value === 'function') {
    value = value.bind(this)
  }

  this[prop] = value
  this[kTeamityDecorates].push(prop)
  return this
}

Teamity.prototype.hasDecorator = function (prop) {
  return prop in this
}

Teamity.prototype.decorateReply = function (prop, value) {
  const rep = this[kTeamityReply]

  rep[prop] = value
  return this
}

Teamity.prototype.hasReplyDecorator = function (prop) {
  const rep = this[kTeamityReply]

  return prop in rep
}

Teamity.prototype.route = function (opts, handler) {
  addRoute.call(this, opts || {}, handler)
  return this
}

Teamity.prototype.setParser = function (parser) {
  this[kTeamityParser] = parser
}

Teamity.prototype.setSerializer = function (serializer) {
  this[kTeamitySerializer] = serializer
}

module.exports = Teamity
