const { EventEmitter } = require('events')
const util = require('util')
const { nanoid } = require('nanoid')

const {
  kSocketTeamity,
  kSocketId,
  kSocketRaw,
  kSocketQuery,
  kSocketSession,
  kSocketJoins,

  kTeamityRooms
} = require('./symbols')

const { initSocketProperties } = require('./properties')
const pkgSplit = Buffer.from('\n')

function Socket (raw, query) {
  this[kSocketId] = nanoid()
  this[kSocketRaw] = raw
  this[kSocketQuery] = {}
  this[kSocketSession] = {}
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

  const pkg = Buffer.concat([topic, pkgSplit, payload])
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

  const pkgIdx = payload.indexOf(pkgSplit)

  if (pkgIdx < 0) {
    return
  }

  const topic = payload.slice(0, pkgIdx)
  const body = payload.slice(pkgIdx + pkgSplit.byteLength)

  this.emit('decode', topic.toString('utf-8'), body)
}

function _onClose () {
  this.leaveAll()
}

module.exports = {
  Socket
}
