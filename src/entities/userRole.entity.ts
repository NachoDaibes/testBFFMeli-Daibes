import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Role } from "./role.entity"
import { User } from "./user.entity"

@Entity({name: 'UserRole'})
export class UserRole{

    @PrimaryGeneratedColumn()
    id: number

    @ManyToOne(() => Role, (role) => role.userRole)
    role: Role 

    @ManyToOne(() => User, (user) => user.userRoles)
    user: User
}