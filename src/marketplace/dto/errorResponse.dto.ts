import { IsNumber, IsString } from "class-validator"

export class ErrorResponseDto{

    @IsString()
    status: string

    @IsNumber()
    statusCode: number

    @IsString()
    message: string
}