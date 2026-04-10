import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, IsDateString, Min, Max, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

// 位置信息 DTO
export class LocationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @IsNotEmpty()
  @IsNumber()
  longitude: number;
}

export class CreateRideDto {
  @IsNotEmpty()
  @IsEnum(['find-car', 'find-passenger'])
  type: string;

  @IsNotEmpty()
  @IsString()
  departure: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  departureLocation?: LocationDto;

  @IsNotEmpty()
  @IsString()
  destination: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  destinationLocation?: LocationDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationDto)
  waypoints?: LocationDto[];

  @IsNotEmpty()
  @IsDateString()
  departureTime: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(8)
  seats?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateRideDto {
  @IsOptional()
  @IsString()
  departure?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @IsDateString()
  departureTime?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(8)
  seats?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsEnum(['active', 'closed', 'expired'])
  status?: string;
}

export class QueryRideDto {
  @IsOptional()
  @IsEnum(['find-car', 'find-passenger'])
  type?: string;

  @IsOptional()
  @IsString()
  departure?: string;

  @IsOptional()
  @IsString()
  destination?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;
}
