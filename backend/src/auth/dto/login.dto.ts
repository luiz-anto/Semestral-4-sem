import { PasswordBytes } from '../../common/decorators/password-bytes.decorator.js';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';
export class LoginDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email: string;
  @PasswordBytes() @IsString() @MinLength(1) password: string;
}
