import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';
import { UserRole } from 'src/entities/userRole.entity';
import { Role } from 'src/entities/role.entity';
import { Session } from 'src/entities/session.entity';
import { config } from 'dotenv';
config();

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole, Role, Session]),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: {
        expiresIn: '5h',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}