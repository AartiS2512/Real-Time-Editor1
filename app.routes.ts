import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { NotesListComponent } from './components/notes-list/notes-list.component';
import { EditorComponent } from './components/editor/editor.component';

export const routes: Routes = [
  { path: '',        component: AuthComponent      },
  { path: 'notes',  component: NotesListComponent  },
  { path: 'note/:id', component: EditorComponent   },
  { path: '**', redirectTo: '' },
];
