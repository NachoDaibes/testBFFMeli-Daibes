import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateMarketplaceDto } from './dto/create-marketplace.dto';
import { UpdateMarketplaceDto } from './dto/update-marketplace.dto';
import axios from 'axios';
import { config } from 'dotenv';
import { ErrorResponseDto } from './dto/errorResponse.dto';
import { CategoryDto, ItemDto, ResponseGetDto } from './dto/responseGet.dto';
import { ResponseDeleteDto } from './dto/responseDelete.dto';
config();

@Injectable()
export class MarketplaceService {
  private readonly logger: Logger = new Logger(MarketplaceService.name);

  async getAllByCategory(category: string): Promise<ResponseGetDto> {
    try {
      //Valido si existen las urls en las variables de entorno
      this.validateEnvVariables();

      //Busco las categorías, para validar si la categoria ingresada es válida
      await this.validateCategory(category);

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
        status: error.name || 'INTERNAL_SERVER_ERROR',
        statusCode: error.status || 500,
        message: error.message || 'Error inesperado con el servidor',
      };

      throw new InternalServerErrorException(generalErrorResponse);
    }
  }

  async deleteAllByCategory(category: string) {
    try {
      //Valido si existen las urls en las variables de entorno
      this.validateEnvVariables();

      //Busco las categorías, para validar si la categoria ingresada es válida
      await this.validateCategory(category);

      //Busco los productos por categoria y los freeShipping de todos los productos
      const productsResponse = await axios.get(`${process.env.PRODUCTS_BY_CATEGORY_URL}/${category}`);
      const productsByCategory = productsResponse.data?.products ?? [];

      if (productsByCategory.length == 0) {
        const responseDeleteDto: ResponseDeleteDto = {
          result: 'OK',
          items_delete: 0,
          items_failed: 0,
        };

        return responseDeleteDto;
      }

      const failedDeletes = [];

      for (const product of productsByCategory) {
        try {
          await axios.delete(`${process.env.DELETE_PRODUCTS_BASE_URL}/${product.id}`);
          this.logger.log(`[MarketPlaceService][deleteAllByCategory] Item con id = ${product.id} eliminado correctamente.`);
        } catch (deleteErr) {
          this.logger.warn(`[MarketplaceService][deleteAllByCategory] No se pudo eliminar el producto ${product.id}`);
          failedDeletes.push(product.id);
        }
      }

      const responseDeleteDto: ResponseDeleteDto = {
        result: 'OK',
        items_delete: productsByCategory.length,
        items_failed: failedDeletes.length,
        items_failed_ids: failedDeletes,
      };

      if (failedDeletes.length >= 0) {
        responseDeleteDto.items_failed = failedDeletes.length;
        responseDeleteDto.items_failed_ids = failedDeletes;
      }

      return responseDeleteDto;
    } catch (error) {
      this.logger.error(`[MarketplaceService][deleteAllByCategory] ${error.message}`);

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
        status: error.name || 'INTERNAL_SERVER_ERROR',
        statusCode: error.status || 500,
        message: error.message || 'Error inesperado con el servidor',
      };

      throw new InternalServerErrorException(generalErrorResponse);
    }
  }

  //Otros métodos
  //Metodo para crear el ResponseDto
  private createResponseGetDto(productsByCategory: any[], freeShipping: any) {
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
  private getPriceDiscount(price: number, discountPercentage: number) {
    return (price * discountPercentage) / 100;
  }

  //Metodo para validar la categoria ingresada
  private async validateCategory(category: string) {
    const categories = await axios.get(`${process.env.CATEGORY_LIST_URL}`);

    this.logger.log(`[MarketplaceService][validateCategory] Lista de categorías: ${JSON.stringify(categories.data)}`);

    //Si la categoría ingresada no existe dentro del array de categorias lanzo una excepción
    if (!categories.data.includes(category)) {
      this.logger.error(
        '[MarketplaceService][validateCategory] La categoría ingresada no existe dentro de la lista de categorías válidas.',
      );
      throw new NotFoundException('La categoría ingresada no existe dentro de la lista de categorías válidas.');
    }
  }

  //Metodo para validar si existen las variables de entorno
  private validateEnvVariables() {
    if (!process.env.CATEGORY_LIST_URL || !process.env.PRODUCTS_BY_CATEGORY_URL || !process.env.FREE_SHIPPING_URL) {
      this.logger.error('[MarketplaceService][validateEnvVariables] Faltan variables de entorno');
      throw new InternalServerErrorException('Faltan URLs de configuración');
    }
  }
}
