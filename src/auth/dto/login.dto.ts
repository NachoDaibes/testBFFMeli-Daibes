import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {

  @IsString()
  @IsNotEmpty()
  @ApiProperty({description: 'Nombre del usuario', type: String, example: 'Nacho Daibes'})
  name: string

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({description: 'Email del usuario', type: String, example: 'nachodaibes@gmail.com'})
  email: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({description: 'Contraseña del usuario', type: String, example: 'nacho12345'})
  password: string
}