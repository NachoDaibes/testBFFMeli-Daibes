import { Controller, Get, Headers, Param, Delete, UnauthorizedException, Logger, BadRequestException, Query } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { AuthService } from 'src/auth/auth.service';
import { SearchProductsQueryDto, SortParamsDto } from './dto/searchProductsQuery.dto';
import { getProductsByQueryMock } from './mock/mockProductsByQuery.mock';
import { GetAllByCategoryMock } from './mock/getAllByCategory.mock';
import { DeleteAllByCategoryMock } from './mock/deleteAllByCategory.mock';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ResponseProductsByQueryDto } from './dto/responseProductsByQuery.dto';

@ApiTags('Marketplace')
@Controller('marketplace')
export class MarketplaceController {
  private readonly logger: Logger = new Logger(MarketplaceController.name);

  constructor(
    private readonly marketplaceService: MarketplaceService,
    private readonly authService: AuthService,
  ) {}

  @ApiSecurity('X-AUTH-TOKEN')
  @ApiOperation({ summary: 'Obtener productos por query.' })
  @ApiOkResponse({
    type: ResponseProductsByQueryDto,
  })
  @ApiHeader({
    name: 'x-auth-token',
    required: true,
    description: 'Token de autenticación requerido para utilizar el endpoint.',
  })
  @ApiHeader({
    name: 'site',
    required: true,
    description: 'Codigo del sitio. Posibles valores: MLA, MLB o MLM.',
  })
  @ApiQuery({
    name: 'q',
    type: String,
    required: true,
    description: 'Texto de busqueda.',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['price', 'rating'],
    description: 'Campo para ordenar los resultados.',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Ordenamiento ascendente o descendente',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Cantidad de productos devueltos.',
  })
  @ApiQuery({
    name: 'offset',
    type: Number,
    required: false,
    description: 'Qué producto es el primero en ser tomado.',
  })
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

  @ApiSecurity('X-AUTH-TOKEN')
  @ApiOperation({ summary: 'Obtener todos los productos de una categoría.' })
  @ApiParam({
    name: 'category',
    required: true,
    description: 'Categoria por la que se va a buscar.',
  })
  @ApiHeader({
    name: 'x-auth-token',
    required: true,
    description: 'Token de autenticación requerido para utilizar el endpoint.',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['price', 'rating'],
    description: 'Campo para ordenar los resultados.',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Ordenamiento ascendente o descendente',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Cantidad de productos devueltos.',
  })
  @ApiQuery({
    name: 'offset',
    type: Number,
    required: false,
    description: 'Qué producto es el primero en ser tomado.',
  })
  @Get('getAllByCategory/:category')
  getAllByCategory(@Query() sortParamsDto: SortParamsDto, @Param('category') category: string, @Headers() headers: Record<string, string>) {
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

    return this.marketplaceService.getAllByCategory(category, sortParamsDto);
  }

  @ApiSecurity('X-AUTH-TOKEN')
  @ApiOperation({ summary: 'Eliminar todos los productos de una categoría.' })
  @ApiParam({
    name: 'category',
    required: true,
    description: 'Categoria por la que se va a buscar.',
  })
  @ApiHeader({
    name: 'x-auth-token',
    required: true,
    description: 'Token de autenticación requerido para utilizar el endpoint.',
  })
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
