import { Controller, Get, Query } from "@nestjs/common";
import { TrackerService } from "./tracker.service";
import { ApiOperation, ApiQuery } from "@nestjs/swagger";
import { OperationsEnum } from "src/enum/operations.enum";

@Controller('tracker')
export class TrackerController{

    constructor(
        private readonly trackerService: TrackerService
    ){}


    @ApiOperation(
        {description: 'Trae todos los registros del tracker que coincidan con la categoria.'}
    )
    @ApiQuery({
        name: 'operation',
        required: true,
        enum: ['getProductsByQuery', 'getAllByCategory', 'deleteAllByCategory'],
    })
    @Get('getTrackingByOperation')
    getTrackingByOperation(@Query('operation') operation: OperationsEnum){
        return this.trackerService.getTrackingByOperation(operation)
    }
    
    @ApiOperation(
        {description: 'Trae todos los registros del tracker que coincidan con el token.'}
    )
    @ApiQuery({
        name: 'token',
        required: true,
        type: String
    })
    @Get('getTrackingByToken')
    getTrackingByToken(@Query('token') token: string){
        return this.trackerService.getTrackingByToken(token)
    }

}