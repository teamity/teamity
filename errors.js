const superError = require('super-error')

const TeamityError = superError.subclass('TeamityError')
const RouteOptionsError = TeamityError.subclass('RouteOptionsError')

const HookCallbackError = TeamityError.subclass(
  'HookCallbackError',
  function () {
    this.message = 'hook callback not allow arrow function'
  }
)

const RouteExistsError = TeamityError.subclass('RouteExistsError', function (
  url
) {
  this.message = `The route has been registered : ${url}`
})

const PluginVersioMismatchError = TeamityError.subclass(
  'PluginVersioMismatchError',
  function (name, expected, installed) {
    this.message = `teamity-plugin: ${name} - expected '${expected}' teamity version, '${installed}' is installed`
  }
)

module.exports = {
  TeamityError,
  RouteOptionsError,
  HookCallbackError,
  RouteExistsError,
  PluginVersioMismatchError
}
