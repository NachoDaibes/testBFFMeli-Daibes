import { Controller, Post, Body, Query, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Endpoint para registrar un usuario' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Usuario creado correctamente' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Endpoint para el login del usuario' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: 201, description: 'Login exitoso' })
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('logout/:userEmail')
  @ApiOperation({ summary: 'Endpoint para el logout del usuario' })
  @ApiParam({ name: 'userEmail', type: String, description: 'Email del usuario.' })
  @ApiResponse({ status: 201, description: 'Logout exitoso' })
  logout(@Param('userEmail') userEmail: string) {
    return this.authService.logout(userEmail);
  }
}
