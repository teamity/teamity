const fastJsonStringify = require('fast-json-stringify')
const { kSerializerBody } = require('./symbols')

function jsonSerializer (body, done) {
  let serializerCall = this[kSerializerBody]
  if (!serializerCall) {
    serializerCall = JSON.stringify
  }
  const serBody = serializerCall(body)
  return done(null, Buffer.from(serBody))
}

function attachSerializer () {
  this.setSerializer(jsonSerializer)

  this.addHook('onRoute', function (route) {
    const schema = route.schema
    if (!schema || !schema.response) return

    const { $options } = this
    route[kSerializerBody] = fastJsonStringify(schema.response, {
      ajv: $options.ajv
    })
  })
}

module.exports = {
  attachSerializer
}
