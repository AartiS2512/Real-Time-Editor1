import {
  Component, OnInit, OnDestroy, ViewChild,
  ElementRef, ChangeDetectorRef
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
})
export class EditorComponent implements OnInit, OnDestroy {
  @ViewChild('textarea') textareaRef: ElementRef<HTMLTextAreaElement>;

  noteId = '';
  title = '';
  content = '';
  saved = true;
  private subs: Subscription[] = [];
  private saveTimer: any;
  private isReceiving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socket: SocketService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const authCode = sessionStorage.getItem('authCode');
    if (!authCode) { this.router.navigate(['/']); return; }

    this.noteId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.noteId) { this.router.navigate(['/notes']); return; }

    // Re-auth then open the note
    this.socket.auth(authCode);
    this.socket.openNote(this.noteId);

    this.subs.push(
      this.socket.onNoteLoaded().subscribe((note) => {
        this.title = note.title;
        this.content = note.content;
        this.cdr.detectChanges();
      }),
      this.socket.onNoteUpdated().subscribe((data) => {
        this.isReceiving = true;
        const ta = this.textareaRef?.nativeElement;
        const pos = ta?.selectionStart;
        this.content = data.content;
        this.title = data.title;
        this.saved = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          if (pos !== undefined && ta) ta.setSelectionRange(pos, pos);
          this.isReceiving = false;
        }, 0);
      }),
    );
  }

  onInput() {
    if (this.isReceiving) return;
    this.saved = false;
    this.socket.sendChange(this.noteId, this.content, this.title);
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => { this.saved = true; this.cdr.detectChanges(); }, 800);
  }

  goBack() { this.router.navigate(['/notes']); }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    clearTimeout(this.saveTimer);
  }
}
