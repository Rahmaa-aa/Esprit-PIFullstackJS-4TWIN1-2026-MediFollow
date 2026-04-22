import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from '../notification/notification.service';

@Injectable()
@WebSocketGateway({
  namespace: '/voice',
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
  },
})
export class VoiceCallGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly notificationService: NotificationService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      let token = client.handshake.auth?.token as string | undefined;
      if (typeof token !== 'string') token = undefined;
      if (token?.startsWith('Bearer ')) token = token.slice(7);
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = await this.jwtService.verifyAsync<{ sub: string; role?: string }>(token);
      client.data.userId = String(payload.sub);
      client.data.role = String(payload.role || '');
      await client.join(`user:${client.data.userId}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const uid = client.data?.userId as string | undefined;
    if (uid) client.leave(`user:${uid}`);
  }

  @SubscribeMessage('voice:invite')
  async invite(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    body: { roomId: string; toUserId: string; offer: unknown; callerName?: string; video?: boolean },
  ) {
    const from = client.data?.userId as string | undefined;
    if (!from || !body?.toUserId || !body?.roomId || body.offer == null) return;
    try {
      await this.notificationService.notifyVoiceInvite({
        calleeUserId: body.toUserId,
        callerName: body.callerName || 'Appel',
        isVideo: !!body.video,
      });
    } catch {
      /* ne pas bloquer la signalisation */
    }
    this.server.to(`user:${body.toUserId}`).emit('voice:incoming', {
      roomId: body.roomId,
      fromUserId: from,
      callerName: body.callerName || 'Appel',
      offer: body.offer,
      video: !!body.video,
    });
  }

  @SubscribeMessage('voice:answer')
  answer(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { roomId: string; toUserId: string; answer: unknown },
  ) {
    const from = client.data?.userId as string | undefined;
    if (!from || !body?.toUserId || !body?.roomId || body.answer == null) return;
    this.server.to(`user:${body.toUserId}`).emit('voice:incoming-answer', {
      roomId: body.roomId,
      fromUserId: from,
      answer: body.answer,
    });
  }

  @SubscribeMessage('voice:ice')
  ice(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { roomId: string; toUserId: string; candidate: unknown },
  ) {
    const from = client.data?.userId as string | undefined;
    if (!from || !body?.toUserId || body.candidate == null) return;
    this.server.to(`user:${body.toUserId}`).emit('voice:ice', {
      roomId: body.roomId,
      fromUserId: from,
      candidate: body.candidate,
    });
  }

  @SubscribeMessage('voice:reject')
  reject(@MessageBody() body: { toUserId: string; roomId?: string }) {
    if (!body?.toUserId) return;
    this.server.to(`user:${body.toUserId}`).emit('voice:rejected', { roomId: body.roomId });
  }

  @SubscribeMessage('voice:hangup')
  hangup(@MessageBody() body: { toUserId: string; roomId?: string }) {
    if (!body?.toUserId) return;
    this.server.to(`user:${body.toUserId}`).emit('voice:hangup', { roomId: body.roomId });
  }
}
