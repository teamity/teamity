const { kParserBody } = require('./symbols')
const { default: AJV } = require('ajv')
const { buildAjvErrorsMsg } = require('./utils')
const secureJson = require('secure-json-parse')

function jsonParser (body) {
  return new Promise((resolve, reject) => {
    body = body.toString('utf-8')
    if (body === '' || !body) {
      return resolve({})
    }
    try {
      body = secureJson.parse(body)

      const validateFn = this[kParserBody]
      if (validateFn && !validateFn(body)) {
        throw new Error(buildAjvErrorsMsg(validateFn.errors))
      }

      return resolve(body)
    } catch (e) {
      return reject(e)
    }
  })
}

function attachParser () {
  this.setParser(jsonParser)

  this.addHook('onRoute', function (route) {
    const schema = route.schema
    if (!schema || !schema.body) return

    const { $options } = this
    const ajv = new AJV($options.ajv)
    route[kParserBody] = ajv.compile(schema.body)
  })
}

module.exports = {
  attachParser
}
