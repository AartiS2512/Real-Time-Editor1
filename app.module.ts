// import { Module } from '@nestjs/common';
// import { NotesGateway } from './editor/notes.gateway';
// import { NotesService } from './editor/notes.service';

// @Module({
//   providers: [NotesGateway, NotesService],

// })
// export class AppModule {}
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesGateway } from './editor/notes.gateway';
import { NotesService } from './editor/notes.service';
import { Note } from './editor/note.entity';
// import { NotesService } from './notes.service';
// import { NotesGateway } from './notes.gateway';
// import { Note } from './note.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'notes.db',
      entities: [Note],
      synchronize: true, // auto creates table
    }),
    TypeOrmModule.forFeature([Note]),
  ],
  providers: [NotesService, NotesGateway],
})
export class AppModule { }
