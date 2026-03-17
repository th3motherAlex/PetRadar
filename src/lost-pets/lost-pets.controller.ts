import { Body, Controller, Post } from '@nestjs/common';
import { CreateLostPetDto } from './dto/create-lost-pet.dto';
import { LostPetsService } from './lost-pets.service';

@Controller('lost-pets')
export class LostPetsController {
  constructor(private readonly lostPetsService: LostPetsService) {}

  @Post()
  create(@Body() createLostPetDto: CreateLostPetDto) {
    return this.lostPetsService.create(createLostPetDto);
  }
}
