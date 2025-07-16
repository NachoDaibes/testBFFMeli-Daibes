import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceService } from './marketplace.service';
import { BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import axios from 'axios';
import { SearchProductsQueryDto, SortParamsDto } from './dto/searchProductsQuery.dto';

jest.mock('axios');

describe('MarketplaceService', () => {
  let service: MarketplaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarketplaceService, Logger],
    }).compile();

    service = module.get<MarketplaceService>(MarketplaceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteAllByCategory', () => {
    it('Debería eliminar todos los productos de una categoría correctamente', async () => {
      const category = 'womens-watches';
      const products = [{ id: 1 }, { id: 2 }];

      // Mock validateCategory y validateEnvVariables
      jest.spyOn(service, 'validateCategory').mockResolvedValue();
      jest.spyOn(service, 'validateEnvVariables').mockImplementation();

      // Mock axios.get para productos por categoría
      (axios.get as jest.Mock).mockImplementation((url: string) => {
        if (url === `${process.env.PRODUCTS_BASE_URL}/category/${category}`) {
          return Promise.resolve({ data: { products } });
        }
        return Promise.reject(new Error('URL desconocida'));
      });

      // Mock axios.delete para cada producto
      (axios.delete as jest.Mock).mockResolvedValue({});

      const result = await service.deleteAllByCategory(category);

      expect(result).toEqual({
        result: 'OK',
        items_delete: 2,
      });
    });

    it('Deberia lanzar error si la categoria es invalida', async () => {
      const category = 'invalid-category';

      jest.spyOn(service, 'validateCategory').mockRejectedValue(new Error('Categoría inválida'));

      await expect(service.deleteAllByCategory(category)).rejects.toThrow(InternalServerErrorException);
    });

    it('Debería lanzar InternalServerErrorException si axios falla al obtener productos', async () => {
      const category = 'womens-watches';

      jest.spyOn(service, 'validateCategory').mockResolvedValue();

      (axios.get as jest.Mock).mockRejectedValue({
        isAxiosError: true,
        response: {
          status: 502,
          statusText: 'Bad Gateway',
          data: { message: 'Error externo' },
        },
      });

      await expect(service.deleteAllByCategory(category)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getProductsByQuery', () => {
    it('debería devolver productos con free_shipping y aplicar filtros correctamente', async () => {
      const mockProducts = [
        { id: 1, title: 'Prod1', price: 100, rating: 4, discountPercentage: 12, images: ['asfsdfasdf'] },
        { id: 2, title: 'Prod2', price: 200, rating: 5, discountPercentage: 9, images: ['asfsdfaasdfsadfsdf'] },
      ];
      const mockFreeShipping = [{ id: 1, free_shipping: true }];

      (axios.get as jest.Mock).mockImplementation(url => {
        if (url.includes('/search')) {
          return Promise.resolve({ data: { products: mockProducts } });
        }
        if (url === process.env.FREE_SHIPPING_URL) {
          return Promise.resolve({ data: { products: mockFreeShipping } });
        }
        return Promise.reject(new Error('Url no mockeada'));
      });

      const site = 'MLA';
      const query: SearchProductsQueryDto = { q: 'Prod', limit: 1, offset: 0, sortBy: 'price', order: 'asc' };

      const result = await service.getProductsByQuery(site, query);

      expect(result.items.length).toBe(1);
      expect(result.items[0].free_shipping).toBe(true);
      expect(result.items[0].price).toBe(100);
      expect(result.items[0].price_with_discount).toBe(88);
    });

    it('debería lanzar BadRequestException para site inválido', async () => {
      await expect(service.getProductsByQuery('INVALID_SITE', { q: 'test' })).rejects.toThrow('Header "site" inválido');
    });
  });

  describe('getAllByCategory', () => {
    it('deberia devolver los productos pertentecientes a una categoria', async () => {
      const products = [
        { id: 1, title: 'Prod1', price: 100, rating: 4, discountPercentage: 12, images: ['asfsdfasdf'] },
        { id: 2, title: 'Prod2', price: 200, rating: 5, discountPercentage: 9, images: ['asfsdfaasdfsadfsdf'] },
      ];
      const mockFreeShipping = [{ id: 1, free_shipping: true }];

      jest.spyOn(service, 'validateCategory').mockResolvedValue();
      (axios.get as jest.Mock).mockImplementation(url => {
        if (url == `${process.env.PRODUCTS_BASE_URL}/category/women-watches`) {
          return Promise.resolve({ data: { products } });
        }
        if (url == process.env.FREE_SHIPPING_URL)
          return Promise.resolve({
            data: {
              products: mockFreeShipping,
            },
          });
        return Promise.reject(new Error('URL no mockeada'));
      });

      const query: SortParamsDto = { sortBy: 'price', order: 'asc', limit: 2, offset: 0 };
      const result = await service.getAllByCategory('women-watches', query);

      expect(result.items.length).toBe(2);
      expect(result.items[0].price).toBe(100);
      expect(result.paging.limit).toBe(2);
    });

    it('deberia lanzar BadRequestException si sortBy no es valido', async () => {
      //lo definí como any porque si no no podia llamar al método, porque 'invalid' no pertenece al enum esperado
      const query: any = { sortBy: 'invalid', order: 'asc' };

      const products = [
        { id: 1, title: 'Prod1', price: 100, rating: 4, discountPercentage: 12, images: ['asfsdfasdf'] },
        { id: 2, title: 'Prod2', price: 200, rating: 5, discountPercentage: 9, images: ['asfsdfaasdfsadfsdf'] },
      ];
      const mockFreeShipping = [{ id: 1, free_shipping: true }];

      jest.spyOn(service, 'validateCategory').mockResolvedValue();
      (axios.get as jest.Mock).mockImplementation(url => {
        if (url == `${process.env.PRODUCTS_BASE_URL}/category/women-watches`) {
          return Promise.resolve({ data: { products } });
        }
        if (url == process.env.FREE_SHIPPING_URL)
          return Promise.resolve({
            data: {
              products: mockFreeShipping,
            },
          });
        return Promise.reject(new Error('URL no mockeada'));
      });
      await expect(service.getAllByCategory('women-watches', query)).rejects.toThrow(BadRequestException);
    });
  });
});
