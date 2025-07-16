import { Module } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceController } from './marketplace.controller';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/entities/user.entity';
import { UserRole } from 'src/entities/userRole.entity';
import { Role } from 'src/entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Session } from 'src/entities/session.entity';
import { TrackerService } from 'src/tracker/tracker.service';
import { Tracker } from 'src/entities/tracker.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session, UserRole, Role, Tracker])
  ],
  controllers: [MarketplaceController],
  providers: [MarketplaceService, AuthService, JwtService, TrackerService],
})
export class MarketplaceModule {}
