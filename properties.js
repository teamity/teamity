const {
  kTeamityName,
  kTeamityOptions,
  kTeamityRoot,
  kTeamityVersion,
  kTeamityAvvio,
  kTeamityPino,
  kTeamityErrio,
  kTeamityServer,

  kRouteParent,
  kRouteTeamity,

  kSocketId,
  kSocketRaw,
  kSocketQuery,
  kSocketSession
} = require('./symbols')

function initProperties (props) {
  for (const pn in props) {
    Object.defineProperty(this, pn, {
      get () {
        return this[props[pn]]
      }
    })
  }
}

function initLogProperty () {
  Object.defineProperty(this, '$log', {
    get () {
      return this.$teamity.$log
    }
  })
}

module.exports = {
  initTeamityProperties () {
    const props = {
      $root: kTeamityRoot,
      $name: kTeamityName,
      $options: kTeamityOptions,
      $version: kTeamityVersion,
      $avvio: kTeamityAvvio,
      $log: kTeamityPino,
      $errio: kTeamityErrio,
      $server: kTeamityServer
    }
    initProperties.call(this, props)
  },
  initRouteProperties () {
    const props = {
      $parent: kRouteParent,
      $teamity: kRouteTeamity
    }
    initProperties.call(this, props)
    initLogProperty.call(this)
  },
  initSocketProperties () {
    const props = {
      $id: kSocketId,
      $raw: kSocketRaw,
      $query: kSocketQuery,
      $session: kSocketSession
    }
    initProperties.call(this, props)
  }
}
