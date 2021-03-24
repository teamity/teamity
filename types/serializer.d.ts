import ROTE from './route'

export type SerializerDone = (err: Error, body: Buffer) => void

export type SerializerCallback = (
  this: ROTE.Route,
  body: any,
  done?: SerializerDone
) => PromiseLike<Buffer> | void
