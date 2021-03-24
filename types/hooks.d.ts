import { Teamity } from './teamity'

export type HookDoneCallback = (err?: Error) => void

export type OnCloseCallback = (this: Teamity) => Promise<void> | void

export type OnErrorCallback = (
  this: Teamity,
  err: Error
) => Promise<void> | void
