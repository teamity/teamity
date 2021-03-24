module.exports = {
  // teamity properties
  kTeamityRoot: Symbol('teamity.root'),
  kTeamityName: Symbol('teamity.name'),
  kTeamityLevel: Symbol('teamity.level'),
  kTeamityFullname: Symbol('teamity.fullname'),
  kTeamityOptions: Symbol('teamity.options'),
  kTeamityRouterPrefix: Symbol('teamity.router.prefix'),
  kTeamityVersion: Symbol('teamity.version'),
  kTeamityAvvio: Symbol('teamity.avvio'),
  kTeamityPino: Symbol('teamity.pino'),
  kTeamityErrio: Symbol('teamity.errio'),
  kTeamityServer: Symbol('teamity.server'),
  kTeamitySockets: Symbol('teamity.sockets'),
  kTeamityRooms: Symbol('teamity.rooms'),

  kTeamityParent: Symbol('teamity.parent'),
  kTeamityChildren: Symbol('teamity.children'),
  kTeamityRoutes: Symbol('teamity.routes'),
  kTeamityDecorates: Symbol('teamity.decorates'),
  kTeamityScope: Symbol('teamity.scope'),
  kTeamityReply: Symbol('teamity.reply'),
  kTeamityParser: Symbol('teamity.parser'),
  kTeamitySerializer: Symbol('teamity.serializer'),

  kQueueRoutes: Symbol('queue.routes'),
  kQueueReplies: Symbol('queue.replies'),

  kSocketTeamity: Symbol('socket.teamity'),
  kSocketCache: Symbol('socket.cache'),
  kSocketId: Symbol('socket.id'),
  kSocketRaw: Symbol('socket.raw'),
  kSocketQuery: Symbol('socket.query'),
  kSocketSession: Symbol('socket.session'),
  kSocketJoins: Symbol('socket.joins'),

  kRouteTeamity: Symbol('route.teamity'),
  kRouteParent: Symbol('route.parent'),
  kRouteScope: Symbol('route.scope'),
  kRouteSocket: Symbol('route.socket'),
  kRouteReply: Symbol('route.reply'),

  kScopeSocket: Symbol('scope.socket'),
  kScopeParams: Symbol('scope.params'),
  kScopeBody: Symbol('scope.body'),
  kScopeUrl: Symbol('scope.url'),

  kParserBody: Symbol('parser.body'),
  kSerializerBody: Symbol('serializer.body'),

  kReplyRoute: Symbol('reply.route'),
  kReplySocket: Symbol('reply.scoket'),
  kReplyRooms: Symbol('reply.rooms'),
  kReplyBroadcast: Symbol('reply.broadcast'),

  kHookLevel: Symbol('hook.level'),

  kTeamityPluginMeta: Symbol.for('teamity.plugin.meta')
}
