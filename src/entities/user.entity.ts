import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { UserRole } from "./userRole.entity"
import { Session } from "./session.entity"

@Entity({name: 'User'})
export class User{

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    email: string

    @Column()
    password: string

    @OneToMany(() => Session, (session) => session.user)
    sessions: Session[]

    @OneToMany(() => UserRole, (userRole) => userRole.user)
    userRoles: UserRole[]
}