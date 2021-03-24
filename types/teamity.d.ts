import PINO from 'pino'
import AVIO from 'avvio'
import HTTP from 'http'
import { Options } from 'ajv'
import ROTR from './router'
import ROTE from './route'
import PLGN from './plugin'
import ERRI from './errio'
import HOOK from './hooks'
import PSER from './parser'
import SZER from './serializer'
import WS from 'ws'

export interface TeamityOptions {
  pino?: PINO.LoggerOptions
  router?: ROTR.RouterOptions
  errio?: ERRI.ErrioOptions
  server?: WS.ServerOptions
  ajv?: Options
}

export type TeamityDoneCallback = () => void

export interface TeamityAfter<I> {
  (fn: (err: Error) => void): I
  (fn: (err: Error, done: TeamityDoneCallback) => void): I
  (fn: (err: Error, context: I, done: TeamityDoneCallback) => void): I
}

export interface TeamityReady<I> {
  (): Promise<I>
  (fn: (err?: Error) => void): void
  (fn: (err: Error, done: TeamityDoneCallback) => void): void
  (fn: (err: Error, context: I, done: TeamityDoneCallback) => void): void
}

export interface TeamityClose<I> {
  (fn: (err: Error) => void): void
  (fn: (err: Error, done: TeamityDoneCallback) => void): void
  (fn: (err: Error, context: I, done: TeamityDoneCallback) => void): void
}

export interface Teamity {
  $root: Readonly<Teamity>
  $name: Readonly<string>
  $options: Readonly<TeamityOptions>
  $version: Readonly<string>
  $avvio: Readonly<AVIO.Avvio<Teamity>>
  $log: Readonly<PINO.Logger>
  $errio: Readonly<ERRI.Errio>
  $server: Readonly<HTTP.Server>

  // avvio export
  register: PLGN.TeamityPlugin
  after: TeamityAfter<Teamity>
  ready: TeamityReady<Teamity>
  close: TeamityClose<Teamity>

  decorate(prop: string, value: unknown): Teamity
  hasDecorator(prop: string): boolean

  decorateReply(prop: string, value: unknown): Teamity
  hasReplyDecorator(prop: string): boolean

  setParser(parser: PSER.ParserCallback): Teamity
  setSerializer(serializer: SZER.SerializerCallback): Teamity

  print(): void

  route(opts: ROTE.Route, handler?: ROTE.RouteHandler<ROTE.Route>): Teamity

  addHook(name: 'onClose', fn: HOOK.OnCloseCallback): Teamity
  addHook(name: 'onError', fn: HOOK.OnErrorCallback): Teamity
  addHook(name: 'onRoute', fn: ROTE.OnRouteCallback<ROTE.Route>): Teamity
  addHook(
    name: 'onBeforeHandler',
    fn: ROTE.OnBeforeHandlerCallback<ROTE.Route>
  ): Teamity
}
