import { IsString, IsNumber, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFavoriteLocationDto {
  @ApiProperty({ description: '地点名称', example: '家' })
  @IsString()
  @Length(1, 50)
  name: string;

  @ApiProperty({ description: '详细地址', example: '广州市天河区xxx路xxx号' })
  @IsString()
  @Length(1, 200)
  address: string;

  @ApiPropertyOptional({ description: '纬度', example: 23.123456 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: '经度', example: 113.123456 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class UpdateFavoriteLocationDto {
  @ApiPropertyOptional({ description: '地点名称', example: '公司' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  name?: string;

  @ApiPropertyOptional({ description: '详细地址', example: '广州市番禺区xxx路xxx号' })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  address?: string;

  @ApiPropertyOptional({ description: '纬度', example: 23.456789 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: '经度', example: 113.456789 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
