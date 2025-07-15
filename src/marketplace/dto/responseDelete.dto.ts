import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResponseDeleteDto {
  @ApiProperty({
    example: 'PARTIAL_OK',
    enum: ['OK', 'PARTIAL_OK', 'FAIL'],
    description: 'Estado final de la operación de eliminación',
  })
  result: 'OK' | 'PARTIAL_OK' | 'FAIL';

  @ApiProperty({
    example: 5,
    description: 'Cantidad de ítems eliminados exitosamente',
  })
  items_delete: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Cantidad de ítems que no se pudieron eliminar (opcional)',
  })
  items_failed?: number[] | number;

  @ApiPropertyOptional({
    example: [101, 203],
    description: 'IDs de los ítems que fallaron al eliminarse (opcional)',
    type: [Number],
  })
  items_failed_ids?: number[] | number;
}
