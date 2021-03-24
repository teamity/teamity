const Pino = require('pino')
const { kTeamityPino } = require('../symbols')
module.exports = function () {
  const pino = Pino(this.$options.pino)
  this[kTeamityPino] = pino
}
