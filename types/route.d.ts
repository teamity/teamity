import PINO from 'pino'
import { JSONSchemaType } from 'ajv'
import { Teamity } from './teamity'
import WebSocket from 'ws'

declare type Known =
  | Record<string, any>
  | [any, ...any[]]
  | any[]
  | number
  | string
  | boolean
  | null

export interface Scope {
  id: Readonly<string>
  url: Readonly<string>
  query: Readonly<Record<string, unknown>>
  session: Readonly<Record<string, unknown>>
  params: Readonly<Record<string, unknown>>
  body: Readonly<Buffer | any>
}

export interface Reply {
  broadcast: Reply
  in(roomId: string): Reply
  emit(event: string, body: any): Reply
}

export interface Socket {
  $id: Readonly<string>
  $raw: Readonly<WebSocket>
  $query: Readonly<Record<string, unknown>>
  $session: Readonly<Record<string, unknown>>
}

export type RouteHandler<S> = (
  this: S,
  scope: Scope,
  rep?: Reply
) => Promise<any> | void

export type OnRouteCallback<S> = (
  this: Teamity,
  route: S
) => Promise<void> | void

export type OnBeforeHandlerCallback<T> = (
  this: T,
  scope: Scope,
  rep: Reply
) => Promise<void> | void

export type OnBeforeConnectionCallback<T> = (
  this: T,
  skt: Socket
) => Promise<void> | void

export type OnAfterDisconnectionCallback<T> = (
  this: T,
  skt: Socket
) => Promise<void> | void

export interface SchemaOptions {
  body: JSONSchemaType<Known>
  response: JSONSchemaType<Known>
}

export interface Route {
  // options
  url: string
  schema?: SchemaOptions
  $usePrefix?: boolean
  handler?: RouteHandler<Route>

  // properties
  $parent: Readonly<Route>
  $teamity: Readonly<Teamity>
  $log: Readonly<PINO.Logger>

  // hooks
  onBeforeHandler?: OnBeforeHandlerCallback<Route>

  join(roomId: string): Route
  leave(roomId: string): Route
  leaveAll(): Route
}
