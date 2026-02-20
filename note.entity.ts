import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Note {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    authCode: string;

    @Column()
    title: string;

    @Column('text')
    content: string;

    @Column()
    updatedAt: Date;
}
