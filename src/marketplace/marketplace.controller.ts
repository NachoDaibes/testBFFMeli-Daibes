import { Controller, Get, Headers, Param, Delete, UnauthorizedException, Logger, BadRequestException, Query } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { AuthService } from 'src/auth/auth.service';
import { SearchProductsQueryDto } from './dto/searchProductsQuery.dto';
import { getProductsByQueryMock } from './mock/mockProductsByQuery.mock';
import { GetAllByCategoryMock } from './mock/getAllByCategory.mock';
import { DeleteAllByCategoryMock } from './mock/deleteAllByCategory.mock';
import { ApiSecurity } from '@nestjs/swagger';

@Controller('marketplace')
export class MarketplaceController {
  private readonly logger: Logger = new Logger(MarketplaceController.name);

  constructor(
    private readonly marketplaceService: MarketplaceService,
    private readonly authService: AuthService,
  ) {}

  @ApiSecurity('X-AUTH-TOKEN')
  @Get('getProductsByQuery')
  getProductsByQuery(@Query() query: SearchProductsQueryDto, @Headers() headers: Record<string, string>) {
    const validateToken = this.authService.validateXAuthToken(headers['x-auth-token']);

    if (!validateToken.isValid) {
      this.logger.error('Token inválido. Unauthorized.');
      throw new UnauthorizedException();
    } else if (validateToken.isMock) {
      return getProductsByQueryMock;
    }

    const site = headers.site;
    return this.marketplaceService.getProductsByQuery(site, query);
  }

  @Get('getAllByCategory/:category')
  getAllByCategory(
    @Query() query: SearchProductsQueryDto,
    @Param('category') category: string,
    @Headers() headers: Record<string, string>,
  ) {
    // /*Valido el token y analizo si alguno de los roles dentro es valido para ejecutar este método, silo es pasa y si no se lanza
    // una excepcion de 'Acceso denegado'*/
    // const validate: string[] = await this.authService.validateAccess(token)
    // const rolesValidos = ['Administrador']

    // if(validate.some(rol => rolesValidos.includes(rol))){
    //   return this.marketplaceService.getAllByCategory(category);
    // }else{
    //   throw new UnauthorizedException()
    // }

    const validateToken = this.authService.validateXAuthToken(headers['x-auth-token']);

    if (!validateToken.isValid) {
      this.logger.error('Token inválido. Unauthorized.');
      throw new UnauthorizedException();
    } else if (validateToken.isMock) {
      //devolver datos mockeados
      return GetAllByCategoryMock;
    }

    return this.marketplaceService.getAllByCategory(category, query);
  }

  @Delete('deleteAllByCategory/:category')
  deleteAllByCategory(@Headers() headers: Record<string, string>, @Param('category') category: string) {
    // /*Valido el token y analizo si alguno de los roles dentro es valido para ejecutar este método, silo es pasa y si no se lanza
    // una excepcion de 'Acceso denegado'*/
    // const validate: string[] = await this.authService.validateAccess(token)
    // const rolesValidos = ['Administrador']

    // if(validate.some(rol => rolesValidos.includes(rol))){
    //   return this.marketplaceService.getAllByCategory(category);
    // }else{
    //   throw new UnauthorizedException()
    // }

    const validateToken = this.authService.validateXAuthToken(headers['x-auth-token']);

    if (!validateToken.isValid) {
      this.logger.error('Token inválido. Unauthorized.');
      throw new UnauthorizedException();
    } else if (validateToken.isMock) {
      //devolver datos mockeados
      return DeleteAllByCategoryMock;
    }

    return this.marketplaceService.deleteAllByCategory(category);
  }
}
