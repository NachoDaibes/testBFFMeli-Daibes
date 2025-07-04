import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { RolesEnum } from 'src/enum/roles.enum';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({description: 'Nombre completo del usuario', type: String, example: 'Nacho Daibes'})
  name: string

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({description: 'Email del usuario', type: String, example: 'nachodaibes@gmail.com'})
  email: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @ApiProperty({description: 'Contraseña (al menos 6 caracteres)', type: String, example: 'nacho12345'})
  password: string

  @IsArray()
  @ArrayNotEmpty({message: 'El array de roles no puede estar vacío'})
  @IsEnum(RolesEnum, {each: true, message: 'Uno de los roles ingresados no es válido. Roles válidos: ' + RolesEnum.UsuarioRegular + RolesEnum.Proveedor + RolesEnum.Administrador})
  @ApiProperty({description: 'Array de Roles', type: Array, example: ["Usuario Regular", "Administrador"]})
  roles: RolesEnum[]
}