import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateMarketplaceDto } from './dto/create-marketplace.dto';
import { UpdateMarketplaceDto } from './dto/update-marketplace.dto';
import axios from 'axios';
import { config } from 'dotenv';
import { ErrorResponseDto } from './dto/errorResponse.dto';
import { CategoryDto, ItemDto, ResponseGetDto } from './dto/responseGet.dto';
config();

@Injectable()
export class MarketplaceService {
  private readonly logger: Logger = new Logger(MarketplaceService.name);

  create(createMarketplaceDto: CreateMarketplaceDto) {
    return 'This action adds a new marketplace';
  }

  async getAllByCategory(category: string): Promise<ResponseGetDto> {
    try {

      //Valido si existen las urls en las variables de entorno
      if (!process.env.CATEGORY_LIST_URL || !process.env.PRODUCTS_BY_CATEGORY_URL || !process.env.FREE_SHIPPING_URL) {
        this.logger.error('[MarketplaceService][getAllByCategory] Faltan variables de entorno');
        throw new InternalServerErrorException('Faltan URLs de configuración');
      }

      //Busco las categorías, para validar si la categoria ingresada es válida
      const categories = await axios.get(`${process.env.CATEGORY_LIST_URL}`);

      this.logger.log(`[MarketplaceService][getAllByCategory] Lista de categorías: ${JSON.stringify(categories.data)}`);

      //Si la categoría ingresada no existe dentro del array de categorias lanzo una excepción
      if (!categories.data.includes(category)) {
        this.logger.error(
          '[MarketplaceService][getAllByCategory]La categoría ingresada no existe dentro de la lista de categorías válidas.',
        );
        throw new NotFoundException('La categoría ingresada no existe dentro de la lista de categorías válidas.');
      }

      //Busco los productos por categoria y los freeShipping de todos los productos
      const productsByCategory = await axios.get(`${process.env.PRODUCTS_BY_CATEGORY_URL}/${category}`);
      const freeShipping = await axios.get(process.env.FREE_SHIPPING_URL);

      //Armo el ResponseGetDto
      const responseGetDto: ResponseGetDto = this.createResponseGetDto(productsByCategory.data.products, freeShipping.data.products);
      this.logger.log('[MarketplaceService][getAllByCategory] ResponseGetDto armado correctamente.');

      return responseGetDto;
    } catch (error) {
      this.logger.error(`[MarketplaceService][getAllByCategory] ${error.message}`);

      //Si el error es una instancia de un Axios error armo la respuesta en base a eso
      if (axios.isAxiosError(error)) {
        const response: ErrorResponseDto = {
          status: 'AXIOS_ERROR',
          statusCode: error.response?.status,
          message: error.response?.data?.message || error.response?.statusText || 'Error con el servicio externo.',
        };
        throw new BadRequestException(response);
      }

      //Si no lanzo una respuesta general
      const generalErrorResponse: ErrorResponseDto = {
        status: 'INTERNAL_SERVER_ERROR',
        statusCode: 500,
        message: 'Error inesperado con el servidor',
      };

      throw new InternalServerErrorException(generalErrorResponse);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} marketplace`;
  }

  update(id: number, updateMarketplaceDto: UpdateMarketplaceDto) {
    return `This action updates a #${id} marketplace`;
  }

  remove(id: number) {
    return `This action removes a #${id} marketplace`;
  }

  //Otros métodos
  //Metodo para crear el ResponseDto
  createResponseGetDto(productsByCategory: any[], freeShipping: any) {

    //Inicializo el ResponseGetDto
    const responseGetDto: ResponseGetDto = new ResponseGetDto();
    responseGetDto.category = new CategoryDto();

    //Comienzo a asignarle valores
    responseGetDto.category.name = productsByCategory[0].category;
    responseGetDto.items = [];

    productsByCategory.forEach(product => {
      const item: ItemDto = {
        id: product.id,
        title: product.title,
        price: product.price,
        picture: product.images[0],
        price_discount: this.getPriceDiscount(product.price, product.discountPercentage),
        rating: product.rating,
        free_shipping: freeShipping.find(pro => pro.id == product.id)?.free_shipping,
      };

      //Una vez creado un item, lo pusheo en el array de items
      responseGetDto.items.push(item);
    });

    return responseGetDto;
  }

  //Metodo para calcular el descuento
  getPriceDiscount(price: number, discountPercentage: number) {
    return (price * discountPercentage) / 100;
  }
}
