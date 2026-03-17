import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../mail/mail.module';
import { FoundPet } from './entities/found-pet.entity';
import { FoundPetsController } from './found-pets.controller';
import { FoundPetsService } from './found-pets.service';

@Module({
  imports: [TypeOrmModule.forFeature([FoundPet]), MailModule],
  controllers: [FoundPetsController],
  providers: [FoundPetsService],
})
export class FoundPetsModule {}
