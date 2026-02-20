import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject, Observable } from 'rxjs';

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: Date;
}

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket;

  private notesList$ = new Subject<Note[]>();
  private noteCreated$ = new Subject<Note>();
  private noteLoaded$ = new Subject<Note>();
  private noteUpdated$ = new Subject<{ content: string; title: string }>();

  constructor() {
    this.socket = io('http://10.10.58.17:3000', { transports: ['websocket', 'polling'] });

    this.socket.on('notes-list', (d) => this.notesList$.next(d));
    this.socket.on('note-created', (d) => this.noteCreated$.next(d));
    this.socket.on('note-loaded', (d) => this.noteLoaded$.next(d));
    this.socket.on('note-updated', (d) => this.noteUpdated$.next(d));
  }

  auth(authCode: string) { this.socket.emit('auth', authCode); }
  createNote(title: string) { this.socket.emit('create-note', title); }
  openNote(noteId: string) { this.socket.emit('open-note', noteId); }
  sendChange(noteId: string, content: string, title: string) {
    this.socket.emit('note-change', { noteId, content, title });
  }
  deleteNote(noteId: string) { this.socket.emit('delete-note', noteId); }

  onNotesList(): Observable<Note[]> { return this.notesList$.asObservable(); }
  onNoteCreated(): Observable<Note> { return this.noteCreated$.asObservable(); }
  onNoteLoaded(): Observable<Note> { return this.noteLoaded$.asObservable(); }
  onNoteUpdated(): Observable<{ content: string; title: string }> { return this.noteUpdated$.asObservable(); }
}
