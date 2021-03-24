import ROTE from './route'

export type ParserDone = (err: Error, body: any) => void

export type ParserCallback = (
  this: ROTE.Route,
  body: Buffer,
  done?: ParserDone
) => PromiseLike<any> | void
