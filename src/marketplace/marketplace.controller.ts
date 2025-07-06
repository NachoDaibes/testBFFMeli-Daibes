import { Controller, Get, Headers, Param, Delete, UnauthorizedException } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { AuthService } from 'src/auth/auth.service';

@Controller('marketplace')
export class MarketplaceController {
  constructor(
    private readonly marketplaceService: MarketplaceService,
    private readonly authService: AuthService
  ) {}

  @Get('getAllByCategory/:category')
  async getAllByCategory(@Headers('authorization') token: string, @Param('category') category: string) {

    /*Valido el token y analizo si alguno de los roles dentro es valido para ejecutar este método, silo es pasa y si no se lanza
    una excepcion de 'Acceso denegado'*/
    const validate: string[] = await this.authService.validateAccess(token)
    const rolesValidos = ['Administrador']

    if(validate.some(rol => rolesValidos.includes(rol))){
      return this.marketplaceService.getAllByCategory(category);
    }else{
      throw new UnauthorizedException()
    }
  }

  @Delete('deleteAllByCategory/:category')
  async deleteAllByCategory(@Headers('authorization') token: string, @Param('category') category: string) {
    /*Valido el token y analizo si alguno de los roles dentro es valido para ejecutar este método, silo es pasa y si no se lanza
    una excepcion de 'Acceso denegado'*/
    const validate: string[] = await this.authService.validateAccess(token)
    const rolesValidos = ['Administrador']

    if(validate.some(rol => rolesValidos.includes(rol))){
      return this.marketplaceService.getAllByCategory(category);
    }else{
      throw new UnauthorizedException()
    }
  }
}
