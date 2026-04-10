import { IsNotEmpty, IsString } from 'class-validator';

export class WechatLoginDto {
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}
