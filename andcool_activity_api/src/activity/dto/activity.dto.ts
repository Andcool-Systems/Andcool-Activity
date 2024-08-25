import { ValidateIf } from 'class-validator';
import { IsNotEmpty, IsNumber, IsString, IsBoolean } from 'class-validator';

export class HeartbeatDto {
    @IsNotEmpty()
    @IsNumber()
    id?: number;

    @IsNotEmpty()
    @IsString()
    @ValidateIf((object, value) => value !== null)
    workplace?: string;

    @IsNotEmpty()
    @IsString()
    @ValidateIf((object, value) => value !== null)
    file?: string;

    @IsNotEmpty()
    @IsBoolean()
    debugging?: boolean;
}