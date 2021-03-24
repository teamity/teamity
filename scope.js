const {
  kScopeSocket,
  kScopeParams,
  kScopeBody,
  kScopeUrl
} = require('./symbols')

class Scope {
  constructor (skt, url, params, body) {
    this[kScopeSocket] = skt
    this[kScopeUrl] = url
    this[kScopeParams] = params
    this[kScopeBody] = body
  }

  get url () {
    return this[kScopeUrl]
  }

  get id () {
    return this[kScopeSocket].$id
  }

  get query () {
    return this[kScopeSocket].$query
  }

  get session () {
    return this[kScopeSocket].$session
  }

  get params () {
    return this[kScopeParams]
  }

  get body () {
    return this[kScopeBody]
  }
}

module.exports = {
  Scope
}
