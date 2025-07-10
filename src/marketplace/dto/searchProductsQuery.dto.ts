import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SortParamsDto {
  @IsOptional()
  @IsIn(['price', 'rating'])
  sortBy?: 'price' | 'rating';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'asc';

  @IsOptional()
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsInt()
  offset?: number;
}

export class SearchProductsQueryDto extends SortParamsDto {
  @IsNotEmpty()
  @IsString()
  q: string;
}
