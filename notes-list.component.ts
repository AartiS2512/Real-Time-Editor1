import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SocketService, Note } from '../../services/socket.service';

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.css'],
})
export class NotesListComponent implements OnInit, OnDestroy {
  notes: Note[] = [];
  filteredNotes: Note[] = [];
  searchQuery = '';
  showNewModal = false;
  newTitle = '';
  private subs: Subscription[] = [];

  constructor(
    private socket: SocketService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const authCode = sessionStorage.getItem('authCode');
    if (!authCode) { this.router.navigate(['/']); return; }

    // Re-auth in case page was refreshed
    this.socket.auth(authCode);

    this.subs.push(
      this.socket.onNotesList().subscribe((notes) => {
        this.notes = notes;
        this.applySearch();
        this.cdr.detectChanges();
      }),
      this.socket.onNoteCreated().subscribe((note) => {
        this.router.navigate(['/note', note.id]);
      }),
    );
  }

  applySearch() {
    const q = this.searchQuery.toLowerCase();
    this.filteredNotes = q
      ? this.notes.filter(n =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
        )
      : [...this.notes];
  }

  onSearch() { this.applySearch(); }

  openNote(note: Note) {
    this.router.navigate(['/note', note.id]);
  }

  createNote() {
    if (!this.newTitle.trim()) return;
    this.socket.createNote(this.newTitle.trim());
    this.showNewModal = false;
    this.newTitle = '';
  }

  logout() {
    sessionStorage.removeItem('authCode');
    this.router.navigate(['/']);
  }

  getPreview(content: string): string {
    return content?.trim().slice(0, 80) || '';
  }

  getTimeAgo(date: Date): string {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  }

  ngOnDestroy() { this.subs.forEach(s => s.unsubscribe()); }
}
