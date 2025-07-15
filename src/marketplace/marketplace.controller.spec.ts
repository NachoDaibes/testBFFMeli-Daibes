import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { AuthService } from 'src/auth/auth.service';
import { getProductsByQueryMock } from './mock/mockProductsByQuery.mock';

describe('MarketplaceController', () => {
  let controller: MarketplaceController;
  let authService: {validateXAuthToken: jest.Mock};
  let marketplaceService: MarketplaceService;
  const req = { method: 'GET', url: '/marketplace/getProductsByQuery' } as Request;

  beforeEach(async () => {
    const mockAuthService = {
      validateXAuthToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarketplaceController],
      providers: [
        MarketplaceService,
        {
          provide: AuthService,
          useValue: mockAuthService
        },
      ],
    }).compile();

    marketplaceService = module.get<MarketplaceService>(MarketplaceService);
    authService = mockAuthService
    controller = module.get<MarketplaceController>(MarketplaceController);
  });

  it('debería devolver datos mock si el token es alternativo', async () => {
    const mockToken = '55a4639f-55e8-4e14-a6cc-b79977b20a4';
    const headers = { 'x-auth-token': mockToken };
    const query = { q: 'test' };

    authService.validateXAuthToken.mockReturnValue({isValid: true, isMock: true})
    jest.spyOn(marketplaceService, 'getProductsByQuery').mockResolvedValue(getProductsByQueryMock);

    const result = await controller.getProductsByQuery(query, headers, req);

    expect(authService.validateXAuthToken).toHaveBeenCalledWith(mockToken);
    expect(result).toEqual(getProductsByQueryMock);
  });
});
