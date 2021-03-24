module.exports = {
  buildAjvErrorsMsg (errs) {
    const es = []
    errs.forEach(e => {
      es.push(`schema path: [${e.schemaPath}] message: ${e.message}`)
    })
    return es.join('\n')
  },
  promisify (fn, ...args) {
    return new Promise((resolve, reject) => {
      let hasDone = false
      function done (err, result) {
        if (hasDone) return
        hasDone = true

        if (err) reject(err)
        resolve(result)
      }

      const pLike = fn(...args, done)
      if (pLike && typeof pLike.then === 'function') {
        pLike.then(result => done(null, result)).catch(e => done(e))
      }
    })
  },
  parseUrl (url) {
    const queryPrefix = url.indexOf('?')
    if (queryPrefix > -1) {
      return {
        pathname: url.slice(0, queryPrefix),
        query: url.slice(queryPrefix + 1)
      }
    } else {
      return {
        pathname: url,
        query: ''
      }
    }
  }
}
