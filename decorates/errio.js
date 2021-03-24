const Errio = require('errio')
const errors = require('../errors')
const { kTeamityErrio } = require('../symbols')

module.exports = function () {
  this.$log.info('teamity decorate $errio')
  Errio.setDefaults(this.$options.errio)
  for (const en in errors) {
    this.$log.debug(`$errio.register: ${en}`)
    Errio.register(errors[en])
  }
  this[kTeamityErrio] = Errio
}
