import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Tracker')
export class Tracker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  method: string;

  @Column()
  operation: string;

  @Column('text')
  headers: string;

  @Column('text', { nullable: true })
  query?: string;

  @Column({ nullable: true })
  token?: string;

  @Column({ nullable: true })
  statusCode?: number;

  @Column('text', { nullable: true })
  responseBody?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column('text', {nullable: true})
  error: string;
}
