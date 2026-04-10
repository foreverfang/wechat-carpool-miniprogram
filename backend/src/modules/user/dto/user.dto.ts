import { IsOptional, IsString, Length, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  nickname?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsString()
  @Length(11, 11)
  phone?: string;
}

export class VerifyIdentityDto {
  @IsNotEmpty()
  @IsString()
  realName: string;

  @IsNotEmpty()
  @IsString()
  idCard: string;
}
