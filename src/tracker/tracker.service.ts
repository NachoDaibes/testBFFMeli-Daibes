import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tracker } from 'src/entities/tracker.entity';
import { Repository } from 'typeorm';
import { TrackerDto } from './dto/tracker.dto';
import { OperationsEnum } from 'src/enum/operations.enum';
import { ErrorResponseDto } from 'src/marketplace/dto/errorResponse.dto';

@Injectable()
export class TrackerService {
  constructor(
    @InjectRepository(Tracker)
    private readonly trackerRepository: Repository<Tracker>,
  ) {}

  async logRequest(data: TrackerDto) {
    const tracker = this.trackerRepository.create({
      method: data.method,
      operation: data.operation,
      headers: JSON.stringify(data.headers),
      query: data.queryParams ? JSON.stringify(data.queryParams) : undefined,
      token: data.token,
      statusCode: data.statusCode,
      responseBody: data.responseBody ? JSON.stringify(data.responseBody) : undefined,
      error: data.error ? JSON.stringify(data.error) : undefined,
    });

    await this.trackerRepository.save(tracker);
  }

  async getTrackingByOperation(operation: OperationsEnum) {
    const tracks = await this.trackerRepository.find({
      where: {
        operation: operation,
      },
    });

    if (tracks.length == 0) {
        const errorResponse: ErrorResponseDto = {
            message: 'No hay registros con la operación ingresada',
            status: 'NO_CONTENT',
            statusCode: HttpStatus.NO_CONTENT
        }
        return errorResponse
    }

    return tracks;
  }

  async getTrackingByToken(token: string) {
    const tracks = await this.trackerRepository.find({
      where: {
        token: token,
      },
    });

    if (tracks.length == 0) {
        const errorResponse: ErrorResponseDto = {
            message: 'No hay registros con el token ingresado',
            status: 'NO_CONTENT',
            statusCode: HttpStatus.NO_CONTENT
        }
        return errorResponse
    }

    return tracks;
  }
}
