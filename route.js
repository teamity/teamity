const { kRouteSocket } = require('./symbols')

function Route (opts) {
  for (const k in opts) {
    this[k] = opts[k]
  }
}

Route.prototype.join = function (roomId) {
  const skt = this[kRouteSocket]
  skt.join(roomId)
  return this
}

Route.prototype.leave = function (roomId) {
  const skt = this[kRouteSocket]
  skt.leave(roomId)
  return this
}

Route.prototype.leaveAll = function () {
  const skt = this[kRouteSocket]
  skt.leaveAll()
  return this
}

module.exports = {
  Route
}
