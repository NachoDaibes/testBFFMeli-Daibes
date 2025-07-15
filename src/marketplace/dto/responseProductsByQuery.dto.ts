import { ApiProperty } from '@nestjs/swagger';

export class PagingDto {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 0 })
  offset: number;

  @ApiProperty({ example: 20 })
  limit: number;
}

export class ProductDto {
  @ApiProperty({ example: '123' })
  id: string;

  @ApiProperty({ example: 'Apple Watch Series 4' })
  title: string;

  @ApiProperty({ example: 399.99 })
  price: number;

  @ApiProperty({ example: 'https://cdn.dummyjson.com/product-images/apple-watch.jpg' })
  picture: string;

  @ApiProperty({ example: 359.99 })
  price_with_discount: number;

  @ApiProperty({ example: 4.5 })
  rating: number;
  
  @ApiProperty({ example: true })
  free_shipping: boolean;
}

export class ResponseProductsByQueryDto {
  @ApiProperty({ type: PagingDto, example: { total: 100, offset: 0, limit: 20 } })
  paging: PagingDto;

  @ApiProperty({ type: [String], example: ['mens-watches', 'womens-watches'] })
  categories: string[];

  @ApiProperty({
    type: [ProductDto],
    example: [
      {
        id: '123',
        title: 'Apple Watch Series 4',
        price: 399.99,
        picture: 'https://cdn.dummyjson.com/product-images/apple-watch.jpg',
        price_with_discount: 359.99,
        rating: 4.5,
        free_shipping: true,
      },
    ],
  })
  items: ProductDto[];
}
