import { Teamity, TeamityOptions } from './types/teamity'

declare function factory (options: TeamityOptions): Teamity

export = factory

export {
  TeamityOptions,
  TeamityDoneCallback,
  TeamityAfter,
  TeamityReady,
  TeamityClose,
  Teamity
} from './types/teamity'

export {
  HookDoneCallback,
  OnCloseCallback,
  OnErrorCallback
} from './types/hooks'

export { RouterOptions } from './types/router'

export {
  PluginDoneCallback,
  PluginOptions,
  PluginCallback,
  TeamityPlugin
} from './types/plugin'

export { ParserDone, ParserCallback } from './types/parser'

export {
  Scope,
  Reply,
  RouteHandler,
  OnRouteCallback,
  OnBeforeHandlerCallback,
  SchemaOptions,
  Route
} from './types/route'

export { SerializerDone, SerializerCallback } from './types/serializer'
