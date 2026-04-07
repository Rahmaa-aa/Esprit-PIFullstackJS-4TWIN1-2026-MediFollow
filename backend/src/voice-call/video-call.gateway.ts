import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class VideoCallGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;
  private logger = new Logger('VideoCallGateway');

  afterInit(server: Server) {
    this.logger.log('VideoCallGateway initialized');
  }

  @SubscribeMessage('call-user')
  handleCallUser(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    // data: { toUserId, fromUserId, offer }
    this.server.to(data.toUserId).emit('incoming-call', data);
  }

  @SubscribeMessage('accept-call')
  handleAcceptCall(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    // data: { toUserId, answer }
    this.server.to(data.toUserId).emit('call-accepted', data);
  }

  @SubscribeMessage('reject-call')
  handleRejectCall(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    // data: { toUserId }
    this.server.to(data.toUserId).emit('call-rejected', data);
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    // data: { toUserId, candidate }
    this.server.to(data.toUserId).emit('ice-candidate', data);
  }

  @SubscribeMessage('hangup')
  handleHangup(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    // data: { toUserId }
    this.server.to(data.toUserId).emit('hangup', data);
  }

  handleConnection(client: Socket) {
    // Attach userId to socket for direct messaging
    const { userId } = client.handshake.query;
    if (userId) {
      client.join(userId);
      this.logger.log(`User ${userId} connected to video call gateway.`);
    }
  }

  handleDisconnect(client: Socket) {
    const { userId } = client.handshake.query;
    if (userId) {
      client.leave(userId);
      this.logger.log(`User ${userId} disconnected from video call gateway.`);
    }
  }
}
