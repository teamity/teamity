const { EventEmitter } = require('events')
const util = require('util')
const { nanoid } = require('nanoid')

const {
  kSocketTeamity,
  kSocketId,
  kSocketRaw,
  kSocketQuery,
  kSocketSession,
  kSocketCache,
  kSocketJoins,

  kTeamityRooms
} = require('./symbols')

const { initSocketProperties } = require('./properties')

function Socket (raw, query) {
  this[kSocketId] = nanoid()
  this[kSocketRaw] = raw
  this[kSocketQuery] = {}
  this[kSocketSession] = {}
  this[kSocketCache] = Buffer.alloc(0)
  this[kSocketJoins] = {}

  initSocketProperties.call(this)

  for (const k in query) {
    this.$query[k] = query[k]
  }

  this.$raw.on('close', this.emit.bind(this, 'close'))
  this.$raw.on('error', this.emit.bind(this, 'error'))
  this.$raw.on('message', this.emit.bind(this, 'message'))

  this.on('message', _onMessage.bind(this))
  this.on('close', _onClose.bind(this))
}

util.inherits(Socket, EventEmitter)

Socket.prototype.send = function (topic, payload) {
  if (!Buffer.isBuffer(topic)) {
    topic = Buffer.from(topic)
  }

  // const toLen = 1 + topic.byteLength + 2 + payload.byteLength
  const tLen = Buffer.alloc(1)
  tLen.writeInt8(topic.byteLength)

  const pLen = Buffer.alloc(2)
  pLen.writeUInt16BE(payload.byteLength)

  const pkg = Buffer.concat([tLen, topic, pLen, payload])

  this.$raw.send(pkg)
}

Socket.prototype.join = function (roomId) {
  const joins = this[kSocketJoins]
  const teamity = this[kSocketTeamity]

  if (joins[roomId] === undefined) {
    joins[roomId] = true

    const rooms = teamity[kTeamityRooms]
    if (!(roomId in rooms)) {
      rooms[roomId] = {}
    }

    const room = rooms[roomId]
    room[this.$id] = true
  }
}

Socket.prototype.leave = function (roomId) {
  const joins = this[kSocketJoins]
  const teamity = this[kSocketTeamity]
  if (joins[roomId] === true) {
    delete joins[roomId]
    const rooms = teamity[kTeamityRooms]
    if (!(roomId in rooms)) {
      return
    }
    const room = rooms[roomId]
    delete room[this.$id]
  }
}

Socket.prototype.leaveAll = function () {
  const joins = this[kSocketJoins]
  for (const roomId in joins) {
    this.leave(roomId)
  }
}

function _onMessage (payload) {
  if (Buffer.isBuffer(payload)) {
    payload = Buffer.from(payload)
  }

  this[kSocketCache] = Buffer.concat([this[kSocketCache], payload])

  const cache = this[kSocketCache]
  let offset = 0

  if (cache.byteLength < offset + 1) {
    return
  }

  const tLen = cache.readInt8(offset)
  offset += tLen + 1

  if (cache.byteLength < offset + 2) {
    return
  }

  const pLen = cache.readUInt16BE(offset)
  offset += pLen + 2

  if (cache.byteLength < offset) {
    return
  }

  offset = 1
  const topic = cache.slice(offset, offset + tLen).toString('utf-8')

  offset += tLen + 2
  const body = cache.slice(offset, offset + pLen)

  offset += pLen
  this[kSocketCache] = cache.slice(offset)

  this.emit('decode', topic, body)
}

function _onClose () {
  this.leaveAll()
}

module.exports = {
  Socket
}
