import { Injectable, HttpException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { ErrorResponseDto } from 'src/marketplace/dto/errorResponse.dto';

@Injectable()
export class ErrorInterceptorService {
  handle(error: any): never {
    // Si ya es una excepción Nest, la relanzo tal cual
    if (error instanceof HttpException) {
      throw error;
    }

    // Si es un error de Axios
    if (axios.isAxiosError(error)) {
      const response: ErrorResponseDto = {
        status: 'AXIOS_ERROR',
        statusCode: error.response?.status,
        message: error.response?.data?.message || error.response?.statusText || 'Error con el servicio externo.',
      };
      throw new BadRequestException(response);
    }

    // Error genérico
    const response: ErrorResponseDto = {
      status: error.name || 'INTERNAL_SERVER_ERROR',
      statusCode: error.status || 500,
      message: error.message || 'Error inesperado con el servidor',
    };

    throw new InternalServerErrorException(response);
  }
}
