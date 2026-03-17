import { Body, Controller, Post } from '@nestjs/common';
import { CreateFoundPetDto } from './dto/create-found-pet.dto';
import { FoundPetsService } from './found-pets.service';

@Controller('found-pets')
export class FoundPetsController {
  constructor(private readonly foundPetsService: FoundPetsService) {}

  @Post()
  create(@Body() createFoundPetDto: CreateFoundPetDto) {
    return this.foundPetsService.create(createFoundPetDto);
  }
}
