import { Controller, Get, Headers, Param, Delete, UnauthorizedException, Logger, BadRequestException, Query, Req } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { AuthService } from 'src/auth/auth.service';
import { SearchProductsQueryDto, SortParamsDto } from './dto/searchProductsQuery.dto';
import { getProductsByQueryMock } from './mock/mockProductsByQuery.mock';
import { GetAllByCategoryMock } from './mock/getAllByCategory.mock';
import { DeleteAllByCategoryMock } from './mock/deleteAllByCategory.mock';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { ResponseProductsByQueryDto } from './dto/responseProductsByQuery.dto';
import { ResponseGetDto } from './dto/responseGet.dto';
import { ResponseDeleteDto } from './dto/responseDelete.dto';
import { TrackerDto } from 'src/tracker/dto/tracker.dto';
import { TrackerService } from 'src/tracker/tracker.service';

@ApiTags('Marketplace')
@Controller('marketplace')
export class MarketplaceController {
  private readonly logger: Logger = new Logger(MarketplaceController.name);

  constructor(
    private readonly marketplaceService: MarketplaceService,
    private readonly authService: AuthService,
    private readonly trackerService: TrackerService,
  ) {}

  @ApiSecurity('X-AUTH-TOKEN')
  @ApiOperation({ summary: 'Obtener productos por query.' })
  @ApiOkResponse({
    description: 'Respuesta exitosa',
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
  async getProductsByQuery(@Query() query: SearchProductsQueryDto, @Headers() headers: Record<string, string>, @Req() req: Request) {
    this.logger.log(`[GET] ${req.url}`);
    this.logger.log(`Headers: ${JSON.stringify(headers)}`);
    this.logger.log(`Query: ${JSON.stringify(query)}`);

    //Valido el token
    const validateToken = this.authService.validateXAuthToken(headers['x-auth-token']);

    //Creo el objeto TrackerData para guardar en la base de datos los resultados obtenidos
    const trackerData: TrackerDto = {
      method: req.method,
      operation: 'getProductsByQuery',
      headers: headers,
      queryParams: query,
      token: headers['x-auth-token'],
    };

    //De acuerdo al token ingresado es el camino que tomo
    if (!validateToken.isValid) {
      this.logger.error('Token inválido. Unauthorized.');
      trackerData.error = 'Unauthorized Exception';
      trackerData.statusCode = 401;
      this.trackerService.logRequest(trackerData);

      throw new UnauthorizedException();
    } else if (validateToken.isMock) {
      this.logger.log(`Response: ${getProductsByQueryMock}`);
      trackerData.responseBody = getProductsByQueryMock;
      trackerData.statusCode = 200;
      this.trackerService.logRequest(trackerData);

      return getProductsByQueryMock;
    }

    try {
      const site = headers.site;
      const response = await this.marketplaceService.getProductsByQuery(site, query);
      trackerData.statusCode = 200;
      trackerData.responseBody = response;
      this.logger.log(`Response: ${response}`);
      this.trackerService.logRequest(trackerData);
      return response;
    } catch (error) {
      trackerData.error = error;
      this.trackerService.logRequest(trackerData);
      return error;
    }
  }

  @ApiSecurity('X-AUTH-TOKEN')
  @ApiOperation({ summary: 'Obtener todos los productos de una categoría.' })
  @ApiOkResponse({
    type: ResponseGetDto,
  })
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
  async getAllByCategory(
    @Query() sortParamsDto: SortParamsDto,
    @Param('category') category: string,
    @Headers() headers: Record<string, string>,
    @Req() req: Request,
  ) {
    this.logger.log(`[GET] ${req.url}`);
    this.logger.log(`SortParamsDto: ${JSON.stringify(sortParamsDto)}`);
    this.logger.log(`Category: ${JSON.stringify(category)}`);
    this.logger.log(`Headers: ${JSON.stringify(headers)}`);

    const validateToken = this.authService.validateXAuthToken(headers['x-auth-token']);

    //Creo el objeto TrackerData para guardar en la base de datos los resultados obtenidos
    const trackerData: TrackerDto = {
      method: req.method,
      operation: 'getAllByCategory',
      headers: headers,
      queryParams: category,
      token: headers['x-auth-token'],
    };

    //De acuerdo al token ingresado es el camino que tomo
    if (!validateToken.isValid) {
      this.logger.error('Token inválido. Unauthorized.');
      trackerData.error = 'Unauthorized Exception';
      trackerData.statusCode = 401;
      this.trackerService.logRequest(trackerData);

      throw new UnauthorizedException();
    } else if (validateToken.isMock) {
      this.logger.log(`Response: ${GetAllByCategoryMock}`);
      trackerData.responseBody = GetAllByCategoryMock;
      trackerData.statusCode = 200;
      this.trackerService.logRequest(trackerData);

      return GetAllByCategoryMock;
    }

    try {
      const response = await this.marketplaceService.getAllByCategory(category, sortParamsDto);
      this.logger.log(`Response: ${response}`);
      trackerData.statusCode = 200;
      trackerData.responseBody = response;
      this.trackerService.logRequest(trackerData);
      return response;
    } catch (error) {
      trackerData.error = error;
      this.trackerService.logRequest(trackerData);
      return error;
    }
  }

  @ApiSecurity('X-AUTH-TOKEN')
  @ApiOperation({ summary: 'Eliminar todos los productos de una categoría.' })
  @ApiOkResponse({
    type: ResponseDeleteDto,
  })
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
  async deleteAllByCategory(@Headers() headers: Record<string, string>, @Param('category') category: string, @Req() req: Request) {
    this.logger.log(`[GET] ${req.url}`);
    this.logger.log(`Headers: ${JSON.stringify(headers)}`);
    this.logger.log(`Category: ${JSON.stringify(category)}`);

    const validateToken = this.authService.validateXAuthToken(headers['x-auth-token']);

    //Creo el objeto TrackerData para guardar en la base de datos los resultados obtenidos
    const trackerData: TrackerDto = {
      method: req.method,
      operation: 'deleteAllByCategory',
      headers: headers,
      queryParams: category,
      token: headers['x-auth-token'],
    };

    //De acuerdo al token ingresado es el camino que tomo
    if (!validateToken.isValid) {
      this.logger.error('Token inválido. Unauthorized.');
      trackerData.error = 'Unauthorized Exception';
      trackerData.statusCode = 401;
      this.trackerService.logRequest(trackerData);

      throw new UnauthorizedException();
    } else if (validateToken.isMock) {
      this.logger.log(`Response: ${DeleteAllByCategoryMock}`);
      trackerData.responseBody = DeleteAllByCategoryMock;
      trackerData.statusCode = 200;
      this.trackerService.logRequest(trackerData);

      return DeleteAllByCategoryMock;
    }

    try {
      const response = await this.marketplaceService.deleteAllByCategory(category);
      this.logger.log(`Response: ${response}`);
      trackerData.statusCode = 200;
      trackerData.responseBody = response;
      this.trackerService.logRequest(trackerData);
      return response;
    } catch (error) {
      trackerData.error = error;
      this.trackerService.logRequest(trackerData);
      return error;
    }
  }
}
