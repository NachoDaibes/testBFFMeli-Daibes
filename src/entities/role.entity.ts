import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { UserRole } from "./userRole.entity"

@Entity({name: 'Role'})
export class Role{

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @OneToMany(() => UserRole, (userRole) => userRole.role)
    userRole: UserRole[]
}