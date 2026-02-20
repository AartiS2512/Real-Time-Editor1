// import {
//   WebSocketGateway, WebSocketServer,
//   SubscribeMessage, OnGatewayDisconnect,
//   MessageBody, ConnectedSocket,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { NotesService } from './notes.service';

// @WebSocketGateway({ cors: { origin: '*' } })
// export class NotesGateway implements OnGatewayDisconnect {
//   @WebSocketServer() server: Server;

//   private socketAuth = new Map<string, string>(); // socketId -> authCode

//   constructor(private readonly notesService: NotesService) { }

//   handleDisconnect(client: Socket) {
//     this.socketAuth.delete(client.id);
//   }

//   @SubscribeMessage('auth')
//   handleAuth(@ConnectedSocket() client: Socket, @MessageBody() authCode: string) {
//     client.join(`auth:${authCode}`);
//     this.socketAuth.set(client.id, authCode);
//     const notes = this.notesService.getAllNotes(authCode);
//     client.emit('notes-list', notes);
//   }

//   @SubscribeMessage('create-note')
//   handleCreate(@ConnectedSocket() client: Socket, @MessageBody() title: string) {
//     const authCode = this.socketAuth.get(client.id);
//     if (!authCode) return;
//     const note = this.notesService.createNote(authCode, title || 'Untitled');
//     const notes = this.notesService.getAllNotes(authCode);
//     this.server.to(`auth:${authCode}`).emit('notes-list', notes);
//     client.emit('note-created', note);
//   }

//   @SubscribeMessage('open-note')
//   handleOpen(@ConnectedSocket() client: Socket, @MessageBody() noteId: string) {
//     const authCode = this.socketAuth.get(client.id);
//     if (!authCode) return;
//     const note = this.notesService.getNote(authCode, noteId);
//     if (note) {
//       client.join(`note:${noteId}`);
//       client.emit('note-loaded', note);
//     }
//   }

//   @SubscribeMessage('note-change')
//   handleChange(
//     @ConnectedSocket() client: Socket,
//     @MessageBody() data: { noteId: string; content: string; title: string },
//   ) {
//     const authCode = this.socketAuth.get(client.id);
//     if (!authCode) return;
//     const note = this.notesService.updateNote(authCode, data.noteId, data.content, data.title);
//     if (!note) return;
//     client.to(`note:${data.noteId}`).emit('note-updated', { content: data.content, title: data.title });
//     const notes = this.notesService.getAllNotes(authCode);
//     this.server.to(`auth:${authCode}`).emit('notes-list', notes);
//   }

//   @SubscribeMessage('delete-note')
//   handleDelete(@ConnectedSocket() client: Socket, @MessageBody() noteId: string) {
//     const authCode = this.socketAuth.get(client.id);
//     if (!authCode) return;
//     this.notesService.deleteNote(authCode, noteId);
//     const notes = this.notesService.getAllNotes(authCode);
//     this.server.to(`auth:${authCode}`).emit('notes-list', notes);
//   }
// }
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotesService } from './notes.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotesGateway implements OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private socketAuth = new Map<string, string>(); // socketId -> authCode

  constructor(private readonly notesService: NotesService) { }

  handleDisconnect(client: Socket) {
    this.socketAuth.delete(client.id);
  }

  @SubscribeMessage('auth')
  async handleAuth(@ConnectedSocket() client: Socket, @MessageBody() authCode: string) {
    client.join(`auth:${authCode}`);
    this.socketAuth.set(client.id, authCode);

    const notes = await this.notesService.getAllNotes(authCode);
    client.emit('notes-list', notes);
  }

  @SubscribeMessage('create-note')
  async handleCreate(@ConnectedSocket() client: Socket, @MessageBody() title: string) {
    const authCode = this.socketAuth.get(client.id);
    if (!authCode) return;

    const note = await this.notesService.createNote(authCode, title || 'Untitled');
    const notes = await this.notesService.getAllNotes(authCode);

    this.server.to(`auth:${authCode}`).emit('notes-list', notes);

    client.emit('note-created', note);
  }

  @SubscribeMessage('open-note')
  async handleOpen(@ConnectedSocket() client: Socket, @MessageBody() noteId: number) {
    const authCode = this.socketAuth.get(client.id);
    if (!authCode) return;

    const note = await this.notesService.getNote(authCode, noteId);
    if (note) {
      client.join(`note:${noteId}`);
      client.emit('note-loaded', note);
    }
  }

  @SubscribeMessage('note-change')
  async handleChange(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { noteId: number; content: string; title: string },
  ) {
    const authCode = this.socketAuth.get(client.id);
    if (!authCode) return;

    const note = await this.notesService.updateNote(authCode, data.noteId, data.content, data.title);
    if (!note) return;

    client.to(`note:${data.noteId}`).emit('note-updated', { content: data.content, title: data.title });

    const notes = await this.notesService.getAllNotes(authCode);
    this.server.to(`auth:${authCode}`).emit('notes-list', notes);
  }

  @SubscribeMessage('delete-note')
  async handleDelete(@ConnectedSocket() client: Socket, @MessageBody() noteId: number) {
    const authCode = this.socketAuth.get(client.id);
    if (!authCode) return;

    await this.notesService.deleteNote(authCode, noteId);
    const notes = await this.notesService.getAllNotes(authCode);
    this.server.to(`auth:${authCode}`).emit('notes-list', notes);
  }
}
