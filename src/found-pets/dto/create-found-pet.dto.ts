import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
} from 'class-validator';

export class CreateFoundPetDto {
  @IsString()
  @IsNotEmpty()
  species: string;

  @IsOptional()
  @IsString()
  breed?: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsString()
  @IsNotEmpty()
  size: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsUrl()
  photo_url?: string;

  @IsString()
  @IsNotEmpty()
  finder_name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  finder_email: string;

  @IsString()
  @Matches(/^[0-9+\-\s()]{7,20}$/)
  finder_phone: string;

  @Type(() => Number)
  @IsLatitude()
  latitude: number;

  @Type(() => Number)
  @IsLongitude()
  longitude: number;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsDateString()
  found_date: string;
}
