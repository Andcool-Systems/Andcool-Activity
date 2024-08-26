import { IsNotEmpty, IsNumber } from 'class-validator';

export class EndActivityDto {
    @IsNotEmpty()
    @IsNumber()
    id?: number;
}