import { ApiProperty } from '@nestjs/swagger';

export class PagingDto {
  @ApiProperty({ example: 50 })
  total: number;

  @ApiProperty({ example: 0 })
  offset: number;

  @ApiProperty({ example: 10 })
  limit: number;
}

export class CategoryDto {
  @ApiProperty({ example: 'mens-watches' })
  name: string;
}

export class ItemDto {
  @ApiProperty({ example: 101 })
  id: number;

  @ApiProperty({ example: 'Samsung Galaxy Watch 5' })
  title: string;

  @ApiProperty({ example: 299.99 })
  price: number;

  @ApiProperty({ example: 'https://cdn.example.com/product-images/watch.jpg' })
  picture: string;

  @ApiProperty({ example: 269.99 })
  price_discount: number;

  @ApiProperty({ example: 4.7 })
  rating: number;

  @ApiProperty({ example: true })
  free_shipping: boolean;
}

export class ResponseGetDto {
  @ApiProperty({ type: PagingDto, example: { total: 50, offset: 0, limit: 10 } })
  paging: PagingDto;

  @ApiProperty({ type: CategoryDto, example: { name: 'mens-watches' } })
  category: CategoryDto;

  @ApiProperty({
    type: [ItemDto],
    example: [
      {
        id: 101,
        title: 'Samsung Galaxy Watch 5',
        price: 299.99,
        picture: 'https://cdn.example.com/product-images/watch.jpg',
        price_discount: 269.99,
        rating: 4.7,
        free_shipping: true,
      },
      {
        id: 102,
        title: 'Apple Watch SE',
        price: 349.99,
        picture: 'https://cdn.example.com/product-images/apple-watch.jpg',
        price_discount: 314.99,
        rating: 4.8,
        free_shipping: false,
      },
    ],
  })
  items: ItemDto[];
}
