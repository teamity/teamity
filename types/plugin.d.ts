import { Teamity } from './teamity'

export type PluginDoneCallback = (err?: Error) => void

export interface PluginOptions {
  name?: string
  prefix?: string
  teamity?: string
}

export type PluginCallback = (
  teamity: Teamity,
  opts: PluginOptions,
  done?: PluginDoneCallback
) => PromiseLike<void> | void

export interface TeamityPlugin<
  Plugin extends PluginCallback = PluginCallback,
  Options extends PluginOptions = PluginOptions
> {
  (plugin: Plugin, opts: Options): Teamity
}
