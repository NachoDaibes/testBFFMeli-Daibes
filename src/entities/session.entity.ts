import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity({name: 'Session'})
export class Session {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(() => User, (user) => user.sessions)
  user: User

  @Column()
  token: string

  @Column({ nullable: true })
  expiredAt: Date
}