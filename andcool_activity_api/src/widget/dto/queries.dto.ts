import { IsOptional, IsString, Max, Min } from "class-validator";
import { IsSort } from "./types.decorator";


export class SortQueryDTO {
    @IsOptional()
    @IsString()
    @IsSort()
    order?: string;
}