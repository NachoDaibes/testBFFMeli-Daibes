import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { config } from 'dotenv';
import { ErrorResponseDto } from './dto/errorResponse.dto';
import { CategoryDto, ItemDto, ResponseGetDto } from './dto/responseGet.dto';
import { ResponseDeleteDto } from './dto/responseDelete.dto';
import { SearchProductsQueryDto, SortParamsDto } from './dto/searchProductsQuery.dto';
import { PagingDto, ProductDto, ResponseProductsByQueryDto } from './dto/responseProductsByQuery.dto';
config();

@Injectable()
export class MarketplaceService {
  private readonly logger: Logger = new Logger(MarketplaceService.name);

  async getProductsByQuery(site: string, query: SearchProductsQueryDto) {
    try {
      this.logger.log('[MarketplaceService][getProductsByQuery] Inicio de búsqueda de productos.');

      if (!site || !['MLA', 'MLB', 'MLM'].includes(site)) {
        this.logger.error('Header "site" inválido. Valores válidos: MLA, MLB o MLM.');
        throw new BadRequestException('Header "site" inválido. Valores válidos: MLA, MLB o MLM.');
      }

      const searchUrl = `${process.env.PRODUCTS_BASE_URL}/search?q=${query.q}`;
      const searchResponse = await axios.get(searchUrl);
      let products = searchResponse.data.products ?? [];

      // Obtener free shipping
      const freeShhippingResponse = await axios.get(process.env.FREE_SHIPPING_URL);
      const freeShipping = freeShhippingResponse.data.products;

      if (query.sortBy && (query.sortBy == 'rating' || query.sortBy == 'price')) {
        const order = query.order?.toLowerCase() == 'desc' ? 'desc' : 'asc';

        products.sort((a, b) => {
          const valueA = a[query.sortBy];
          const valueB = b[query.sortBy];

          if (order === 'asc') {
            return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
          } else {
            return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
          }
        });
        this.logger.log(`[MarketplaceService][getProductsByQuery] Productos ordenados por ${query.sortBy} (${order}).`);
      }else if(query.sortBy && !(query.sortBy == 'rating' || query.sortBy == 'price')){
        this.logger.error('[MarketplaceService][getProductsByQuery] El ordenamiento puede ser por price o rating.')
        throw new BadRequestException('El ordenamiento puede ser por price o rating.')
      }

      const { limit, offset, paginatedProducts } = this.createPaginatedProducts(query, products);

      const finalProducts: ResponseProductsByQueryDto = this.createFinalProductsDto(
        limit,
        offset,
        paginatedProducts,
        freeShipping,
      );
      finalProducts.paging.total = products.length

      return finalProducts;
    } catch (error) {
      this.logger.error(`[MarketplaceService][getProductsByQuery] ${error.message}`);

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

  async getAllByCategory(category: string, query: SortParamsDto): Promise<ResponseGetDto> {
    try {
      //Valido si existen las urls en las variables de entorno
      this.validateEnvVariables();

      //Busco las categorías, para validar si la categoria ingresada es válida
      await this.validateCategory(category);

      //Busco los productos por categoria y los freeShipping de todos los productos
      const productsResponse = await axios.get(`${process.env.PRODUCTS_BASE_URL}/category/${category}`);
      let productsByCategory = productsResponse.data.products ?? [];
      const freeShipping = await axios.get(process.env.FREE_SHIPPING_URL);

      if (query.sortBy && (query.sortBy == 'rating' || query.sortBy == 'price')) {
        const order = query.order?.toLowerCase() == 'desc' ? 'desc' : 'asc';

        productsByCategory.sort((a, b) => {
          const valueA = a[query.sortBy];
          const valueB = b[query.sortBy];

          if (order === 'asc') {
            return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
          } else {
            return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
          }
        });
        this.logger.log(`[MarketplaceService][getAllByCategory] Productos ordenados por ${query.sortBy} (${order}).`);
      }else if(query.sortBy && !(query.sortBy == 'rating' || query.sortBy == 'price')){
        this.logger.error('[MarketplaceService][getAllByCategory] El ordenamiento puede ser por price o rating.')
        throw new BadRequestException('El ordenamiento puede ser por price o rating.')
      }

      const { limit, offset, paginatedProducts } = this.createPaginatedProducts(query, productsByCategory);

      //Armo el ResponseGetDto
      const responseGetDto: ResponseGetDto = this.createResponseGetDto(paginatedProducts, freeShipping.data.products, limit, offset);
      responseGetDto.paging.total = productsByCategory.length

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
      const productsResponse = await axios.get(`${process.env.PRODUCTS_BASE_URL}/category/${category}`);
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
          await axios.delete(`${process.env.PRODUCTS_BASE_URL}/${product.id}`);
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
  private createResponseGetDto(productsByCategory: any[], freeShipping: any, limit: number, offset: number) {
    //Inicializo el ResponseGetDto
    const responseGetDto: ResponseGetDto = new ResponseGetDto();
    responseGetDto.category = new CategoryDto();
    responseGetDto.paging = new PagingDto()

    //Comienzo a asignarle valores
    responseGetDto.category.name = productsByCategory[0].category;
    responseGetDto.paging.limit = limit
      responseGetDto.paging.offset = offset
    responseGetDto.items = [];

    productsByCategory.forEach(product => {
      const item: ItemDto = {
        id: product.id,
        title: product.title,
        price: product.price,
        picture: product.images[0],
        price_discount: this.getPriceDiscount(product.price, product.discountPercentage),
        rating: product.rating,
        free_shipping: freeShipping.find(pro => pro.id == product.id)?.free_shipping || false,
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
    const categories = await axios.get(`${process.env.PRODUCTS_BASE_URL}/category-list`);

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
    if (!process.env.PRODUCTS_BASE_URL || !process.env.FREE_SHIPPING_URL) {
      this.logger.error('[MarketplaceService][validateEnvVariables] Faltan variables de entorno');
      throw new InternalServerErrorException('Faltan URLs de configuración');
    }
  }

  //Metodo para paginar la lista de productos
  private createPaginatedProducts(query: SearchProductsQueryDto | SortParamsDto, products: any) {
    const limit = query.limit ? +query.limit : 20;
    const offset = query.offset ? +query.offset : 0;

    if (isNaN(limit) || limit <= 0) {
      this.logger.error('El limit debe ser un número positivo.');
      throw new BadRequestException('El limitd debe ser un número positivo.');
    }

    if (isNaN(offset) || offset < 0) {
      this.logger.error('El offset debe ser un número mayor o igual que 0.');
      throw new BadRequestException('El offset debe ser un número mayor o igual que 0.');
    }

    const paginatedProducts = products.slice(offset, offset + limit);
    return { limit, offset, paginatedProducts };
  }

  //Metodo para crear la respuesta final del endpoint GetProductsByQuery
  private createFinalProductsDto(limit: number, offset: number, paginatedProducts: any, freeShipping: any) {
    const finalProducts: ResponseProductsByQueryDto = new ResponseProductsByQueryDto();
    finalProducts.paging = new PagingDto();
    finalProducts.categories = [];
    finalProducts.items = [];

    finalProducts.paging.limit = limit;
    finalProducts.paging.offset = offset;

    paginatedProducts.map(product => {
      if (!finalProducts.categories.includes(product.category)) {
        finalProducts.categories.push(product.category);
      }
      const item: ProductDto = {
        id: product.id,
        title: product.title,
        price: product.price,
        picture: product.images[0],
        price_with_discount: product.price - this.getPriceDiscount(product.price, product.discountPercentage),
        rating: product.rating,
        free_shipping: freeShipping.find(pro => pro.id == product.id)?.free_shipping || false,
      };

      finalProducts.items.push(item);
    });
    return finalProducts;
  }
}
