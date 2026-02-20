// import { Injectable } from '@nestjs/common';

// export interface Note {
//   id: string;
//   title: string;
//   content: string;
//   updatedAt: Date;
// }

// @Injectable()
// export class NotesService {
//   private store = new Map<string, Map<string, Note>>();

//   private getNotesMap(authCode: string): Map<string, Note> {
//     if (!this.store.has(authCode)) {
//       this.store.set(authCode, new Map());
//     }
//     return this.store.get(authCode);
//   }

//   getAllNotes(authCode: string): Note[] {
//     const notes = this.getNotesMap(authCode);
//     return Array.from(notes.values()).sort(
//       (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
//     );
//   }

//   getNote(authCode: string, noteId: string): Note | null {
//     return this.getNotesMap(authCode).get(noteId) || null;
//   }

//   createNote(authCode: string, title: string): Note {
//     const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
//     const note: Note = { id, title, content: '', updatedAt: new Date() };
//     this.getNotesMap(authCode).set(id, note);
//     return note;
//   }

//   updateNote(authCode: string, noteId: string, content: string, title?: string): Note | null {
//     const notes = this.getNotesMap(authCode);
//     const note = notes.get(noteId);
//     if (!note) return null;
//     note.content = content;
//     note.updatedAt = new Date();
//     if (title !== undefined) note.title = title;
//     return note;
//   }

//   deleteNote(authCode: string, noteId: string): boolean {
//     return this.getNotesMap(authCode).delete(noteId);
//   }
// }
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './note.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private noteRepo: Repository<Note>,
  ) { }

  async getAllNotes(authCode: string): Promise<Note[]> {
    return this.noteRepo.find({
      where: { authCode },
      order: { updatedAt: 'DESC' },
    });
  }

  async getNote(authCode: string, noteId: number): Promise<Note | null> {
    return this.noteRepo.findOne({ where: { id: noteId, authCode } });
  }

  async createNote(authCode: string, title: string): Promise<Note> {
    const note = this.noteRepo.create({
      authCode,
      title,
      content: '',
      updatedAt: new Date(),
    });
    return this.noteRepo.save(note);
  }

  async updateNote(authCode: string, noteId: number, content: string, title?: string): Promise<Note | null> {
    const note = await this.getNote(authCode, noteId);
    if (!note) return null;
    note.content = content;
    note.updatedAt = new Date();
    if (title !== undefined) note.title = title;
    return this.noteRepo.save(note);
  }

  async deleteNote(authCode: string, noteId: number): Promise<boolean> {
    const result = await this.noteRepo.delete({ id: noteId, authCode });
    return result.affected ? true : false;
  }
}
