const {
  kReplySocket,
  kReplyRooms,
  kReplyBroadcast,
  kReplyRoute,

  kRouteScope,
  kRouteSocket,

  kTeamitySockets,
  kTeamityRooms,

  kQueueReplies
} = require('./symbols')

class Reply {
  get broadcast () {
    this[kReplyBroadcast] = true
    return this
  }
}

function initReply (skt) {
  this[kReplyBroadcast] = false
  this[kReplySocket] = skt
  this[kReplyRooms] = {}
}

Reply.prototype.in = function (roomId) {
  if (this[kReplyBroadcast]) {
    return this
  }

  const rooms = this[kReplyRooms]
  rooms[roomId] = true

  return this
}

Reply.prototype.emit = function (event, body) {
  const route = this[kReplyRoute]
  const self = route[kRouteSocket]

  if (body === undefined) {
    const scope = route[kRouteScope]
    body = event
    event = scope.url
  }

  const { $teamity } = route

  const sockets = $teamity[kTeamitySockets]
  const toRooms = Object.keys(this[kReplyRooms])
  const toSockets = []

  if (this[kReplyBroadcast]) {
    for (const sktId in sockets) {
      if (sktId !== self.$id) {
        toSockets.push(sockets[sktId])
      }
    }
  } else if (toRooms.length > 0) {
    const rooms = $teamity[kTeamityRooms]
    const idmap = {}
    for (const roomId of toRooms) {
      const room = rooms[roomId]
      if (!room) {
        continue
      }

      for (const mem in room) {
        if (mem !== self.$id && idmap[mem] === undefined) {
          idmap[mem] = true
          toSockets.push(sockets[mem])
        }
      }
    }
  } else {
    toSockets.push(self)
  }

  $teamity[kQueueReplies].push({
    topic: event,
    body,
    sockets: toSockets
  })

  this[kReplyRooms] = {}
  this[kReplyBroadcast] = false

  return this
}

module.exports = {
  Reply,
  initReply
}
